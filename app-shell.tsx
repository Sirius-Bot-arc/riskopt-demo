"use client"

import { useCallback, useEffect, useState } from "react"
import { GlobalSearch } from "@/components/global-search"
import { NavContext, type ViewId } from "@/components/nav-context"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Overview } from "@/components/views/overview"
import { RiskExplorer } from "@/components/views/risk-explorer"
import { SecurityControls } from "@/components/views/security-controls"
import { InvestmentOptimizer } from "@/components/views/investment-optimizer"
import { Reports } from "@/components/views/reports"
import { AppStateProvider } from "@/lib/app-state"
import { OrganizationOnboarding } from "@/components/organization-onboarding"

export function AppShell() {
  const [view, setViewState] = useState<ViewId>("overview")
  const [riskId, setRiskId] = useState<string | null>(null)
  const [controlId, setControlId] = useState<string | null>(null)
  const [notificationId, setNotificationId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  const setView = useCallback((v: ViewId) => {
    setRiskId(null)
    setControlId(null)
    setViewState(v)
  }, [])

  const openRisk = useCallback((id: string) => {
    setRiskId(id)
    setViewState("risk-explorer")
  }, [])

  const openControl = useCallback((id: string) => {
    setControlId(id)
    setViewState("controls")
  }, [])

  const openNotification = useCallback((id: string) => {
    setNotificationId(id)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <AppStateProvider>
      <NavContext.Provider
        value={{
          view,
          setView,
          riskId,
          openRisk,
          clearRisk: () => setRiskId(null),
          controlId,
          openControl,
          clearControl: () => setControlId(null),
          openSearch: () => setSearchOpen(true),
          notificationId,
          openNotification,
          clearNotification: () => setNotificationId(null),
          openOnboarding: () => setOnboardingOpen(true),
        }}
      >
        <div className="flex h-dvh overflow-hidden bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
                {view === "overview" && <Overview />}
                {view === "risk-explorer" && <RiskExplorer />}
                {view === "controls" && <SecurityControls />}
                {view === "optimizer" && <InvestmentOptimizer />}
                {view === "reports" && <Reports />}
              </div>
            </main>
          </div>
        </div>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        <OrganizationOnboarding open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      </NavContext.Provider>
    </AppStateProvider>
  )
}
