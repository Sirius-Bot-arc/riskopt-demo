"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Building2, ChevronDown, Menu, Search } from "lucide-react"
import { useNav, type ViewId } from "@/components/nav-context"
import { ORGANIZATIONS, RECENT_CHANGES } from "@/lib/data"
import { cn } from "@/lib/utils"

const TITLES: Record<ViewId, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Organization-wide cyber risk posture" },
  "risk-explorer": { title: "Risk Explorer", subtitle: "Inspect and rank individual risks" },
  controls: { title: "Security Controls", subtitle: "Available controls and their impact" },
  optimizer: { title: "Investment Optimizer", subtitle: "Allocate budget for maximum risk reduction" },
  reports: { title: "Reports", subtitle: "Export and share your risk assessment" },
}

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [onClose])
  return ref
}

export function Topbar() {
  const { view, openSearch } = useNav()
  const [org, setOrg] = useState<string>(ORGANIZATIONS[0])
  const [orgOpen, setOrgOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const orgRef = useClickOutside(() => setOrgOpen(false))
  const notifRef = useClickOutside(() => setNotifOpen(false))
  const meta = TITLES[view]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden">
          <Menu className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight">{meta.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={openSearch}
        className="hidden items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent md:flex"
      >
        <Search className="size-4" />
        <span>Search risks & controls</span>
        <kbd className="ml-6 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="flex size-9 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-colors hover:bg-accent md:hidden"
      >
        <Search className="size-4" />
      </button>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setNotifOpen((v) => !v)}
          className="relative flex size-9 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-colors hover:bg-accent"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-critical" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-border bg-popover p-2 shadow-xl ring-1 ring-foreground/10">
            <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recent risk changes
            </p>
            {RECENT_CHANGES.map((n) => (
              <div key={n.risk} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-accent">
                <span
                  className={cn(
                    "mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    n.change > 0 ? "bg-critical/15 text-critical" : "bg-success/15 text-success",
                  )}
                >
                  {n.change > 0 ? "+" : ""}
                  {n.change}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.risk}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organization selector */}
      <div ref={orgRef} className="relative">
        <button
          type="button"
          onClick={() => setOrgOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Building2 className="size-4 text-primary" />
          <span className="hidden max-w-32 truncate sm:inline">{org}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
        {orgOpen && (
          <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl ring-1 ring-foreground/10">
            {ORGANIZATIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  setOrg(o)
                  setOrgOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent",
                  o === org && "text-primary",
                )}
              >
                <Building2 className="size-4" />
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
