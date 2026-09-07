"use client"

import {
  FileText,
  LayoutDashboard,
  Radar,
  ShieldCheck,
  ShieldHalf,
  Target,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useNav, type ViewId } from "@/components/nav-context"
import { cn } from "@/lib/utils"

const NAV: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "risk-explorer", label: "Risk Explorer", icon: Radar },
  { id: "controls", label: "Security Controls", icon: ShieldCheck },
  { id: "optimizer", label: "Investment Optimizer", icon: Target },
  { id: "reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
  const { view, setView, clearRisk } = useNav()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldHalf className="size-5" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">RiskOpt</span>
          <span className="text-[11px] text-muted-foreground">Cyber Risk Intelligence</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Platform
        </p>
        {NAV.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                clearRisk()
                setView(item.id)
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/60 p-3">
          <p className="text-xs font-medium">Assessment period</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Q3 FY2026 · Updated today</p>
        </div>
      </div>
    </aside>
  )
}
