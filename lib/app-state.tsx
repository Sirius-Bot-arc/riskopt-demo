"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import {
  ORGANIZATIONS,
  type Objective,
  type OrgNotification,
  type Organization,
  type OrganizationAssessment,
  buildOrganizationFromAssessment,
} from "@/lib/data"
import { runOptimization, type OptimizationResult } from "@/lib/optimizer"

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

const AppStateContext = createContext<AppStateValue | null>(null)

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider")
  return ctx
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [customOrgs, setCustomOrgs] = useState<Organization[]>([])
  const organizations = useMemo(() => [...ORGANIZATIONS, ...customOrgs], [customOrgs])
  const [orgId, setOrgIdState] = useState<string>(ORGANIZATIONS[0].id)
  const org = useMemo(() => organizations.find((o) => o.id === orgId) ?? ORGANIZATIONS[0], [organizations, orgId])

  const [budget, setBudgetState] = useState<number>(ORGANIZATIONS[0].budgetDefault)
  const [objective, setObjectiveState] = useState<Objective>("max-reduction")
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const [notifState, setNotifState] = useState<Record<string, OrgNotification[]>>(() => {
    const initial: Record<string, OrgNotification[]> = {}
    for (const o of ORGANIZATIONS) initial[o.id] = o.notifications.map((n) => ({ ...n }))
    return initial
  })

  const setOrgId = useCallback((id: string) => {
    setOrgIdState(id)
    const next = organizations.find((o) => o.id === id) ?? ORGANIZATIONS[0]
    setBudgetState(next.budgetDefault)
    setHasRun(false)
  }, [organizations])

  const addOrganization = useCallback((assessment: OrganizationAssessment) => {
    const next = buildOrganizationFromAssessment(assessment)
    setCustomOrgs((prev) => [...prev.filter((o) => o.id !== next.id), next])
    setNotifState((prev) => ({ ...prev, [next.id]: next.notifications.map((n) => ({ ...n })) }))
    setOrgIdState(next.id)
    setBudgetState(next.budgetDefault)
    setObjectiveState(assessment.objective)
    setHasRun(false)
  }, [])

  const setBudget = useCallback((value: number) => {
    setBudgetState(value)
    setHasRun(false)
  }, [])

  const setObjective = useCallback((value: Objective) => {
    setObjectiveState(value)
    setHasRun(false)
  }, [])

  const result = useMemo(() => runOptimization(org, budget, objective), [org, budget, objective])

  const runOptimizer = useCallback(() => {
    setRunning(true)
    window.setTimeout(() => {
      setRunning(false)
      setHasRun(true)
      setNotifState((prev) => {
        const current = prev[org.id] ?? []
        const already = current.some((n) => n.id === "optimization-run")
        const entry: OrgNotification = {
          id: "optimization-run",
          title: "Budget optimization completed",
          message: `Investment Optimizer generated a new plan for ${org.name} within a ${Math.round(
            budget / 100000,
          )}L budget.`,
          time: "Just now",
          severity: "Info",
          read: false,
        }
        const withoutOld = current.filter((n) => n.id !== "optimization-run")
        return { ...prev, [org.id]: already ? [entry, ...withoutOld] : [entry, ...current] }
      })
    }, 900)
  }, [org, budget])

  const notifications = notifState[org.id] ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifState((prev) => ({
        ...prev,
        [org.id]: (prev[org.id] ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      }))
    },
    [org.id],
  )

  const markAllNotificationsRead = useCallback(() => {
    setNotifState((prev) => ({
      ...prev,
      [org.id]: (prev[org.id] ?? []).map((n) => ({ ...n, read: true })),
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
    result: hasRun ? result : null,
    runOptimizer,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
