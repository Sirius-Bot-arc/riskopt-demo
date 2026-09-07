"use client"

import { useEffect, useMemo, useState } from "react"
import { Radar, Search, ShieldCheck } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { SeverityBadge } from "@/components/severity-badge"
import { CONTROLS, RISKS, formatINRShort } from "@/lib/data"
import { cn } from "@/lib/utils"

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openRisk, openControl } = useNav()
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const q = query.trim().toLowerCase()
  const risks = useMemo(
    () => RISKS.filter((r) => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)),
    [q],
  )
  const controls = useMemo(
    () => CONTROLS.filter((c) => !q || c.name.toLowerCase().includes(q) || c.protects.join(" ").toLowerCase().includes(q)),
    [q],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-2xl ring-1 ring-foreground/10">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search risks and controls..."
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {risks.length === 0 && controls.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for &ldquo;{query}&rdquo;
            </p>
          )}

          {risks.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Risks
              </p>
              {risks.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    openRisk(r.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <Radar className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">{r.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{r.score}</span>
                  <SeverityBadge severity={r.severity} />
                </button>
              ))}
            </div>
          )}

          {controls.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Controls
              </p>
              {controls.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    openControl(c.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  <span className={cn("text-xs tabular-nums text-muted-foreground")}>
                    {formatINRShort(c.cost)} · -{c.riskReduction}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
