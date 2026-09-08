"use client"

import { ArrowRight, Check, Info, Loader2, Sparkles, TrendingDown, Wallet } from "lucide-react"
import { DonutChart } from "@/components/charts/donut-chart"
import { RiskGauge } from "@/components/risk-gauge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OBJECTIVES, formatINR, formatINRShort, getControl } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"

const DONUT_COLORS = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5", "text-chart-1"]

export function InvestmentOptimizer() {
  const { org, budget, setBudget, objective, setObjective, running, result, runOptimizer } = useAppState()

  const selectedControls = result
    ? result.controlIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c)
    : []
  const excludedControls = result
    ? result.excludedIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c)
    : []

  const step = Math.max(50000, Math.round((org.budgetMax - org.budgetMin) / 24 / 50000) * 50000)

  return (
    <div key={org.id} className="animate-in fade-in-0 slide-in-from-bottom-1 grid gap-6 duration-300 lg:grid-cols-[22rem_1fr]">
      {/* Configuration panel */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Optimization Goal</CardTitle>
            <CardDescription>What should the optimizer prioritize?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {OBJECTIVES.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setObjective(o.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-xl border p-3 text-left transition-all",
                  objective === o.id
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:-translate-y-px hover:bg-accent",
                )}
              >
                <span className="flex items-center justify-between text-sm font-medium">
                  {o.label}
                  {objective === o.id && <Check className="size-4 text-primary" />}
                </span>
                <span className="text-xs text-muted-foreground">{o.description}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
            <CardDescription>Maximum amount {org.name} can invest right now</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums">{formatINRShort(budget)}</span>
              <span className="text-xs text-muted-foreground">{formatINR(budget)}</span>
            </div>
            <input
              type="range"
              min={org.budgetMin}
              max={org.budgetMax}
              step={step}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Budget"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{formatINRShort(org.budgetMin)}</span>
              <span>{formatINRShort(org.budgetMax)}</span>
            </div>
            <Button onClick={runOptimizer} disabled={running} className="w-full">
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Run Optimization
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {!result && !running && (
          <Card className="flex min-h-96 flex-1 items-center justify-center border-dashed">
            <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="size-6" />
              </span>
              <h3 className="text-lg font-semibold">Ready to optimize</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Pick a goal and budget, then run the optimizer to see which controls deliver the
                greatest risk reduction for {org.name}&rsquo;s money.
              </p>
            </div>
          </Card>
        )}

        {running && (
          <Card className="flex min-h-96 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Evaluating control combinations against {org.name}&rsquo;s budget...
              </p>
            </div>
          </Card>
        )}

        {result && !running && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex flex-col gap-4 duration-500">
            {/* Before / after */}
            <Card>
              <CardHeader>
                <CardTitle>Projected Impact</CardTitle>
                <CardDescription>Estimated risk posture after implementing the plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-around">
                  <div className="flex flex-col items-center gap-1">
                    <RiskGauge score={result.riskBefore} size={132} label="Before" />
                  </div>
                  <ArrowRight className="size-6 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1">
                    <RiskGauge score={result.riskAfter} size={132} label="After" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Risk Reduced</p>
                    <p className="text-lg font-semibold text-success">-{result.percentReduction}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Exposure Cut</p>
                    <p className="text-lg font-semibold text-success">{formatINRShort(result.exposureReduced)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="text-lg font-semibold">{formatINRShort(result.totalInvestment)}</p>
                  </div>
                </div>
                <p className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-center text-sm font-medium text-primary">
                  {result.percentReduction}% risk reduction · {formatINRShort(result.exposureReduced)} exposure
                  reduced for {formatINRShort(result.totalInvestment)} invested
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
              {/* Recommended plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Investment Plan</CardTitle>
                  <CardDescription>
                    {selectedControls.length} controls selected within {formatINRShort(budget)} budget
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {selectedControls.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
                          <Check className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            Protects: {c.protects.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums">{formatINRShort(c.cost)}</p>
                          <p className="inline-flex items-center gap-0.5 text-xs text-success">
                            <TrendingDown className="size-3" />-{c.riskReduction}%
                          </p>
                        </div>
                      </div>
                      {result.explanations[c.id] && (
                        <p className="flex items-start gap-1.5 pl-11 text-xs text-muted-foreground">
                          <Info className="mt-0.5 size-3 shrink-0" />
                          {result.explanations[c.id]}
                        </p>
                      )}
                    </div>
                  ))}
                  {excludedControls.length > 0 && (
                    <p className="mt-1 px-1 text-xs text-muted-foreground">
                      Excluded: {excludedControls.map((c) => c.name).join(", ")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Budget allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Budget Allocation</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <DonutChart
                    slices={[
                      ...selectedControls.map((c, i) => ({
                        label: c.name,
                        value: c.cost,
                        color: DONUT_COLORS[i % DONUT_COLORS.length],
                      })),
                      ...(result.remainingBudget > 0
                        ? [{ label: "Unspent", value: result.remainingBudget, color: "text-muted-foreground/40" }]
                        : []),
                    ]}
                    centerValue={formatINRShort(result.totalInvestment)}
                    centerLabel="allocated"
                  />
                  <div className="flex w-full flex-col gap-1.5">
                    {selectedControls.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs">
                        <span
                          className={cn("size-2.5 rounded-full bg-current", DONUT_COLORS[i % DONUT_COLORS.length])}
                        />
                        <span className="flex-1 text-muted-foreground">{c.name}</span>
                        <span className="tabular-nums">{formatINRShort(c.cost)}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 border-t border-border pt-1.5 text-xs">
                      <Wallet className="size-3 text-muted-foreground" />
                      <span className="flex-1 text-muted-foreground">Unspent</span>
                      <span className="tabular-nums">{formatINRShort(Math.max(0, result.remainingBudget))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
