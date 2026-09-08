"use client"

import { useState } from "react"
import { Check, Download, FileText, Mail, Printer, Sparkles } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/severity-badge"
import { formatINR, formatINRShort, getControl, getOverview, OBJECTIVES } from "@/lib/data"
import { useAppState } from "@/lib/app-state"

const SECTIONS = [
  { id: "summary", label: "Executive Summary", desc: "High-level posture for leadership" },
  { id: "risks", label: "Detailed Risk Register", desc: "All risks with scores and exposure" },
  { id: "controls", label: "Recommended Controls", desc: "Optimizer plan and rationale" },
  { id: "trend", label: "Trend Analysis", desc: "Risk movement over time" },
]

export function Reports() {
  const { setView } = useNav()
  const { org, budget, objective, result } = useAppState()
  const overview = getOverview(org)
  const [selected, setSelected] = useState<string[]>(SECTIONS.map((s) => s.id))
  const [format, setFormat] = useState<"pdf" | "csv">("pdf")

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const topRisks = [...org.risks].sort((a, b) => b.score - a.score).slice(0, 5)
  const objectiveLabel = OBJECTIVES.find((o) => o.id === objective)?.label ?? objective
  const planControls = result
    ? result.controlIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c)
    : []

  return (
    <div key={org.id} className="animate-in fade-in-0 slide-in-from-bottom-1 grid gap-6 duration-300 lg:grid-cols-[1fr_20rem]">
      {/* Report preview */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Cyber Risk Assessment Report</h2>
              <p className="text-xs text-muted-foreground">{org.name} · {org.industry} · Generated today</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-6 py-6">
          {selected.includes("summary") && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Executive Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryStat label="Overall Risk" value={`${overview.overallRisk}/100`} />
                <SummaryStat label="Severity" value={overview.overallSeverity} />
                <SummaryStat label="Exposure" value={formatINRShort(overview.exposure)} />
                <SummaryStat label="Critical Risks" value={String(overview.criticalRisks)} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {org.name} currently carries a{" "}
                <strong className="text-foreground">{overview.overallSeverity}</strong> overall cyber risk
                posture driven primarily by {topRisks[0]?.name.toLowerCase()} and{" "}
                {topRisks[1]?.name.toLowerCase()} exposure. An estimated {formatINR(overview.exposure)} in
                annual loss exposure can be materially reduced by allocating the{" "}
                {formatINRShort(overview.budget)} security budget toward the highest-impact controls.
              </p>
            </section>
          )}

          {selected.includes("risks") && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Top Risks
              </h3>
              <div className="overflow-hidden rounded-xl border border-border">
                {topRisks.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0"
                  >
                    <span className="w-8 text-sm font-semibold tabular-nums">{r.score}</span>
                    <span className="flex-1 text-sm font-medium">{r.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatINRShort(r.exposure)}
                    </span>
                    <SeverityBadge severity={r.severity} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {selected.includes("controls") && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended Controls
              </h3>
              {result ? (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Latest optimizer run · {objectiveLabel} · {formatINRShort(budget)} budget ·{" "}
                    <span className="font-medium text-success">-{result.percentReduction}% risk</span>
                  </p>
                  <div className="overflow-hidden rounded-xl border border-border">
                    {planControls.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0"
                      >
                        <span className="flex-1 text-sm font-medium">{c.name}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{formatINRShort(c.cost)}</span>
                        <span className="text-xs font-medium text-success">-{c.riskReduction}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    No optimization has been run yet for {org.name}.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setView("optimizer")}>
                    <Sparkles className="size-4" />
                    Run Optimizer
                  </Button>
                </div>
              )}
            </section>
          )}

          {selected.includes("trend") && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Trend Analysis
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-border px-4 py-3">
                {org.riskTrend.map((t) => (
                  <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-sm font-semibold tabular-nums">{t.score}</span>
                    <span className="text-[11px] text-muted-foreground">{t.month}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </Card>

      {/* Export controls */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Include Sections</CardTitle>
            <CardDescription>Choose what to include in the export</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {SECTIONS.map((s) => {
              const on = selected.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {on && <Check className="size-3.5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {(["pdf", "csv"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium uppercase transition-colors ${
                    format === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button className="w-full" disabled={selected.length === 0}>
              <Download className="size-4" />
              Download Report
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Printer className="size-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="size-4" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  )
}
