"use client"

import { useState } from "react"
import { ArrowRight, Check, Loader2, Sparkles, TrendingDown, Wallet } from "lucide-react"
import { DonutChart } from "@/components/charts/donut-chart"
import { RiskGauge } from "@/components/risk-gauge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CONTROLS,
  OBJECTIVES,
  OPTIMIZATION_RESULTS,
  getControl,
  formatINR,
  formatINRShort,
  type Objective,
} from "@/lib/data"
import { cn } from "@/lib/utils"

const DONUT_COLORS = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"]

export function InvestmentOptimizer() {
  const [objective, setObjective] = useState<Objective>("max-reduction")
  const [budget, setBudget] = useState(1000000)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<Objective | null>(null)

  function run() {
    setRunning(true)
    setResult(null)
    window.setTimeout(() => {
      setRunning(false)
      setResult(objective)
    }, 900)
  }

  const data = result ? OPTIMIZATION_RESULTS[result] : null
  const selectedControls = data
    ? data.controlIds.map((id) => getControl(id)).filter((c): c is NonNullable<typeof c> => !!c)
    : []
  const remaining = data ? budget - data.totalInvestment : budget

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
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
                  "flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors",
                  objective === o.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-accent",
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
            <CardDescription>Maximum amount available to invest</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums">{formatINRShort(budget)}</span>
              <span className="text-xs text-muted-foreground">{formatINR(budget)}</span>
            </div>
            <input
              type="range"
              min={200000}
              max={1500000}
              step={100000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Budget"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>₹2L</span>
              <span>₹15L</span>
            </div>
            <Button onClick={run} disabled={running} className="w-full">
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
        {!data && !running && (
          <Card className="flex min-h-96 flex-1 items-center justify-center border-dashed">
            <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-6" />
              </span>
              <h3 className="text-lg font-semibold">Ready to optimize</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Pick a goal and budget, then run the optimizer to see which controls deliver the
                greatest risk reduction for your money.
              </p>
            </div>
          </Card>
        )}

        {running && (
          <Card className="flex min-h-96 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Evaluating control combinations against your budget...
              </p>
            </div>
          </Card>
        )}

        {data && (
          <>
            {/* Before / after */}
            <Card>
              <CardHeader>
                <CardTitle>Projected Impact</CardTitle>
                <CardDescription>Estimated risk posture after implementing the plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-around">
                  <div className="flex flex-col items-center gap-1">
                    <RiskGauge score={data.riskBefore} size={132} label="Before" />
                  </div>
                  <ArrowRight className="size-6 text-muted-foreground" />
                  <div className="flex flex-col items-center gap-1">
                    <RiskGauge score={data.riskAfter} size={132} label="After" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Risk Reduced</p>
                    <p className="text-lg font-semibold text-success">-{data.expectedReduction}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Exposure Cut</p>
                    <p className="text-lg font-semibold text-success">
                      {formatINRShort(data.exposureBefore - data.exposureAfter)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="text-lg font-semibold">{formatINRShort(data.totalInvestment)}</p>
                  </div>
                </div>
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
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                    >
                      <span className="flex size-8 items-center justify-center rounded-md bg-success/15 text-success">
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
                  ))}
                  {CONTROLS.filter((c) => !data.controlIds.includes(c.id)).length > 0 && (
                    <p className="mt-1 px-1 text-xs text-muted-foreground">
                      Excluded:{" "}
                      {CONTROLS.filter((c) => !data.controlIds.includes(c.id))
                        .map((c) => c.name)
                        .join(", ")}
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
                      ...(remaining > 0
                        ? [{ label: "Unspent", value: remaining, color: "text-muted-foreground/40" }]
                        : []),
                    ]}
                    centerValue={formatINRShort(data.totalInvestment)}
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
                      <span className="tabular-nums">{formatINRShort(Math.max(0, remaining))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
