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
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

const NAV: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "risk-explorer", label: "Risk Explorer", icon: Radar },
  { id: "controls", label: "Security Controls", icon: ShieldCheck },
  { id: "optimizer", label: "Investment Optimizer", icon: Target },
  { id: "reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
  const { view, setView } = useNav()
  const { org } = useAppState()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <ShieldHalf className="size-5" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">RiskOpt</span>
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
              onClick={() => setView(item.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
                aria-hidden="true"
              />
              <item.icon className={cn("size-4 transition-colors", active && "text-primary")} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-sidebar-accent/60 p-3">
          <p className="truncate text-xs font-medium">{org.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{org.tagline}</p>
        </div>
      </div>
    </aside>
  )
}
