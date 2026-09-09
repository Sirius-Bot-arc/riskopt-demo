"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import {
  ORGANIZATIONS,
  getOverview,
  type Objective,
  type OrgNotification,
  type Organization,
  type OrganizationAssessment,
  buildOrganizationFromAssessment,
} from "@/lib/data"

import type { OptimizationResult } from "@/lib/optimizer"

interface AppStateValue {
  org: Organization
  orgId: string
  organizations: Organization[]
  setOrgId: (id: string) => void
  addOrganization: (assessment: OrganizationAssessment) => void

  budget: number
  setBudget: (value: number) => void

  objective: Objective
  setObjective: (value: Objective) => void

  running: boolean
  hasRun: boolean
  result: OptimizationResult | null
  runOptimizer: () => void

  notifications: OrgNotification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const AppStateContext =
  createContext<AppStateValue | null>(null)

const BACKEND_URL =
  "https://riskopt-demo.onrender.com"

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)

  if (!ctx) {
    throw new Error(
      "useAppState must be used within AppStateProvider",
    )
  }

  return ctx
}

export function AppStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [customOrgs, setCustomOrgs] =
    useState<Organization[]>([])

  const organizations = useMemo(
    () => [...ORGANIZATIONS, ...customOrgs],
    [customOrgs],
  )

  const [orgId, setOrgIdState] =
    useState<string>(ORGANIZATIONS[0].id)

  const org = useMemo(
    () =>
      organizations.find(
        (o) => o.id === orgId,
      ) ?? ORGANIZATIONS[0],
    [organizations, orgId],
  )

  const [budget, setBudgetState] =
    useState<number>(
      ORGANIZATIONS[0].budgetDefault,
    )

  const [objective, setObjectiveState] =
    useState<Objective>("max-reduction")

  const [running, setRunning] =
    useState(false)

  const [hasRun, setHasRun] =
    useState(false)

  const [backendResult, setBackendResult] =
    useState<OptimizationResult | null>(null)

  const [notifState, setNotifState] =
    useState<Record<string, OrgNotification[]>>(
      () => {
        const initial: Record<
          string,
          OrgNotification[]
        > = {}

        for (const o of ORGANIZATIONS) {
          initial[o.id] =
            o.notifications.map((n) => ({
              ...n,
            }))
        }

        return initial
      },
    )

  const setOrgId = useCallback(
    (id: string) => {
      setOrgIdState(id)

      const next =
        organizations.find(
          (o) => o.id === id,
        ) ?? ORGANIZATIONS[0]

      setBudgetState(next.budgetDefault)
      setHasRun(false)
      setBackendResult(null)
    },
    [organizations],
  )

  const addOrganization =
    useCallback(
      (
        assessment: OrganizationAssessment,
      ) => {
        const next =
          buildOrganizationFromAssessment(
            assessment,
          )

        setCustomOrgs((prev) => [
          ...prev.filter(
            (o) => o.id !== next.id,
          ),
          next,
        ])

        setNotifState((prev) => ({
          ...prev,
          [next.id]:
            next.notifications.map(
              (n) => ({ ...n }),
            ),
        }))

        setOrgIdState(next.id)
        setBudgetState(next.budgetDefault)
        setObjectiveState(
          assessment.objective,
        )
        setHasRun(false)
        setBackendResult(null)
      },
      [],
    )

  const setBudget = useCallback(
    (value: number) => {
      setBudgetState(value)
      setHasRun(false)
      setBackendResult(null)
    },
    [],
  )

  const setObjective = useCallback(
    (value: Objective) => {
      setObjectiveState(value)
      setHasRun(false)
      setBackendResult(null)
    },
    [],
  )

  const runOptimizer = useCallback(
    async () => {
      setRunning(true)
      setHasRun(false)

      try {
        const backendObjective =
          objective === "max-reduction"
            ? "maximum-risk-reduction"
            : objective

        const response = await fetch(
          `${BACKEND_URL}/optimize`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              organization: org.name,
              budget,
              objective:
                backendObjective,
            }),
          },
        )

        if (!response.ok) {
          const errorText =
            await response.text()

          throw new Error(
            `Optimization failed: ${response.status} ${errorText}`,
          )
        }

        const data =
          await response.json()

        const selectedNames =
          new Set(
            data.selected_controls.map(
              (control: {
                name: string
              }) => control.name,
            ),
          )

        const selectedControls =
          org.controls.filter(
            (control) =>
              selectedNames.has(
                control.name,
              ),
          )

        const controlIds =
          selectedControls.map(
            (control) => control.id,
          )

        const excludedIds =
          org.controls
            .filter(
              (control) =>
                !selectedNames.has(
                  control.name,
                ),
            )
            .map(
              (control) =>
                control.id,
            )

        /*
         * Exposure comes from the existing
         * organization overview data.
         */
        const overview =
          getOverview(org)

        const exposureBefore =
          overview.exposure

        /*
         * Keep the backend risk result,
         * but enforce a realistic minimum
         * residual risk.
         */
        const riskBefore =
          Number(data.risk_before)

        const riskAfter =
          Math.max(
            10,
            Number(data.risk_after),
          )

        const actualRiskReduction =
          riskBefore - riskAfter

        const percentReduction =
          riskBefore > 0
            ? Math.round(
                (actualRiskReduction /
                  riskBefore) *
                  100,
              )
            : 0

        /*
         * Estimate financial exposure
         * proportionally to residual risk.
         */
        const exposureAfter =
          riskBefore > 0
            ? Math.max(
                Math.round(
                  exposureBefore *
                    (riskAfter /
                      riskBefore),
                ),
                0,
              )
            : exposureBefore

        const exposureReduced =
          exposureBefore -
          exposureAfter

        const explanations: Record<
          string,
          string
        > = {}

        for (const control of selectedControls) {
          const backendControl =
            data.selected_controls.find(
              (item: {
                name: string
              }) =>
                item.name ===
                control.name,
            )

          if (!backendControl) {
            continue
          }

          const perLakh = (
            backendControl.risk_reduction /
            (backendControl.cost /
              100000)
          ).toFixed(1)

          if (
            objective ===
            "max-reduction"
          ) {
            explanations[
              control.id
            ] =
              `${control.name} was prioritized for its strong absolute risk reduction of ${backendControl.risk_reduction} points within the available budget.`
          } else if (
            objective ===
            "best-value"
          ) {
            explanations[
              control.id
            ] =
              `${control.name} provides approximately ${perLakh} risk-reduction points per ₹1L invested, making it a strong value choice.`
          } else {
            explanations[
              control.id
            ] =
              `${control.name} provides ${backendControl.risk_reduction} points of risk reduction while contributing to broader risk coverage.`
          }
        }

        const result: OptimizationResult =
          {
            controlIds,
            excludedIds,

            totalInvestment:
              data.total_investment,

            remainingBudget:
              data.remaining_budget,

            expectedReduction:
              actualRiskReduction,

            percentReduction,

            riskBefore,

            riskAfter,

            exposureBefore,

            exposureAfter,

            exposureReduced,

            explanations,
          }

        setBackendResult(result)
        setHasRun(true)

        setNotifState((prev) => {
          const current =
            prev[org.id] ?? []

          const entry:
            OrgNotification = {
            id: "optimization-run",
            title:
              "Budget optimization completed",
            message:
              `Investment Optimizer generated a new plan for ${org.name} within a ${Math.round(
                budget / 100000,
              )}L budget.`,
            time: "Just now",
            severity: "Info",
            read: false,
          }

          const withoutOld =
            current.filter(
              (n) =>
                n.id !==
                "optimization-run",
            )

          return {
            ...prev,
            [org.id]: [
              entry,
              ...withoutOld,
            ],
          }
        })
      } catch (error) {
        console.error(
          "RiskOpt optimization error:",
          error,
        )

        alert(
          "RiskOpt couldn't reach the optimization engine. Please try again.",
        )
      } finally {
        setRunning(false)
      }
    },
    [org, budget, objective],
  )

  const notifications =
    notifState[org.id] ?? []

  const unreadCount =
    notifications.filter(
      (n) => !n.read,
    ).length

  const markNotificationRead =
    useCallback(
      (id: string) => {
        setNotifState((prev) => ({
          ...prev,
          [org.id]: (
            prev[org.id] ?? []
          ).map((n) =>
            n.id === id
              ? {
                  ...n,
                  read: true,
                }
              : n,
          ),
        }))
      },
      [org.id],
    )

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifState((prev) => ({
        ...prev,
        [org.id]: (
          prev[org.id] ?? []
        ).map((n) => ({
          ...n,
          read: true,
        })),
      }))
    }, [org.id])

  const value: AppStateValue = {
    org,
    orgId,
    organizations,

    setOrgId,
    addOrganization,

    budget,
    setBudget,

    objective,
    setObjective,

    running,
    hasRun,

    result:
      hasRun
        ? backendResult
        : null,

    runOptimizer,

    notifications,
    unreadCount,

    markNotificationRead,
    markAllNotificationsRead,
  }

  return (
    <AppStateContext.Provider
      value={value}
    >
      {children}
    </AppStateContext.Provider>
  )
}
