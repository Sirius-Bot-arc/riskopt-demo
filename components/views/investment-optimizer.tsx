"use client"

import { ArrowDownRight, ArrowRight, Check, ChevronDown, Info, Loader2, Sparkles, TrendingDown, Wallet, WandSparkles, Zap } from "lucide-react"
import { DonutChart } from "@/components/charts/donut-chart"
import { RiskGauge } from "@/components/risk-gauge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OBJECTIVES, formatINR, formatINRShort, getControl } from "@/lib/data"
import { useAppState } from "@/lib/app-state"
import { cn } from "@/lib/utils"
import { RiskOptIntelligence } from "@/components/riskopt-intelligence"

const DONUT_COLORS = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5", "text-chart-1"]

export function InvestmentOptimizer() {
  const { org, budget, setBudget, objective, setObjective, running, result, runOptimizer } = useAppState()
  const selectedControls = result ? result.controlIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c) : []
  const excludedControls = result ? result.excludedIds.map((id) => getControl(org, id)).filter((c): c is NonNullable<typeof c> => !!c) : []
  const step = Math.max(50000, Math.round((org.budgetMax - org.budgetMin) / 24 / 50000) * 50000)
  const coverage = new Set(selectedControls.map((c) => c.category)).size
  const budgetUsedPct = result && budget > 0 ? Math.min(100, Math.round((result.totalInvestment / budget) * 100)) : 0
  const bestMove = selectedControls[0]

  return (
    <div key={org.id} className="page-enter flex flex-col gap-5">
      <section className="optimizer-hero optimizer-command-center">
        <div className="optimizer-stars" />
        <div className="optimizer-bubble bubble-one" />
        <div className="optimizer-bubble bubble-two" />
        <div className="optimizer-sparkle sparkle-one">✦</div>
        <div className="optimizer-sparkle sparkle-two">✦</div>
        <div className="optimizer-hero-glow" />
        <div className="relative z-10 max-w-4xl">
          <div className="eyebrow"><span className="eyebrow-dot" /> DECISION LAB · {org.name.toUpperCase()}</div>
          <h2 className="optimizer-title">Give RiskOpt a budget.<br /><span>We&apos;ll find the smartest move.</span></h2>
          <p className="hero-copy max-w-2xl">Compare protection value, coverage and cost — then turn your cyber budget into a plan you can explain in the room.</p>
          <div className="hero-chips"><span>✦ AI-guided</span><span>◌ Budget-aware</span><span>♡ Explainable</span></div>
        </div>
        <div className="relative z-10 optimizer-orbit-panel">
          <div className="orbit-mini-ring"><span>{result ? result.riskAfter : org.risk}</span><small>{result ? "PROJECTED" : "CURRENT"} RISK</small></div>
          <div className="orbit-spark orbit-spark-a">✦</div>
          <div className="orbit-spark orbit-spark-b">•</div>
          <p>{result ? "Your plan is ready." : "Your decision space is ready."}</p>
          <span>₹{Math.round(budget / 100000)}L to deploy thoughtfully</span>
        </div>
        <div className="optimizer-hero-bottom">
          <div><span className="micro-label">CURRENT POSTURE</span><strong>{result ? result.riskBefore : org.risk}<small>/100</small></strong></div>
          <div className="hero-arrow">→</div>
          <div><span className="micro-label">PROJECTED</span><strong className="projected">{result ? result.riskAfter : "?"}<small>/100</small></strong></div>
          <div className="hero-separator" />
          <div><span className="micro-label">BUDGET</span><strong>{formatINRShort(budget)}</strong></div>
          <div className="hero-flow-label"><Zap className="size-3" /> live decision model</div>
        </div>
      </section>

      <RiskOptIntelligence compact />

      <div className="optimizer-stepper" aria-label="Optimization workflow">
        <div className="step-dot active"><span>01</span><b>Choose strategy</b></div>
        <div className="step-line" />
        <div className={cn("step-dot", result && "active")}><span>02</span><b>Set capital</b></div>
        <div className="step-line" />
        <div className={cn("step-dot", result && "active")}><span>03</span><b>See the outcome</b></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <aside className="flex flex-col gap-4">
          <Card className="premium-card optimizer-control-card">
            <CardHeader><p className="section-kicker">01 · STRATEGY</p><CardTitle className="mt-1 text-lg">What should win?</CardTitle><p className="card-hint">Tell the engine what matters most.</p></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {OBJECTIVES.map((o) => (
                <button key={o.id} type="button" onClick={() => setObjective(o.id)} className={cn("objective-card", objective === o.id && "objective-active")}>
                  <span className="flex items-center justify-between text-sm font-bold">{o.label}{objective === o.id && <span className="objective-check"><Check className="size-3.5" /></span>}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{o.description}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="premium-card optimizer-control-card">
            <CardHeader><p className="section-kicker">02 · CAPITAL</p><CardTitle className="mt-1 text-lg">Investment ceiling</CardTitle><p className="card-hint">Move the slider. The decision model follows.</p></CardHeader>
            <CardContent>
              <div className="budget-readout"><span>{formatINRShort(budget)}</span><small>{formatINR(budget)}</small></div>
              <div className="budget-track-wrap">
                <input type="range" min={org.budgetMin} max={org.budgetMax} step={step} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="budget-range" aria-label="Budget" />
                <div className="budget-thumb-glow" style={{ left: `${((budget - org.budgetMin) / Math.max(1, org.budgetMax - org.budgetMin)) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-slate-400"><span>{formatINRShort(org.budgetMin)}</span><span>{formatINRShort(org.budgetMax)}</span></div>
              <div className="budget-signal"><span className="signal-dot" /><span>Budget changes update the decision space instantly.</span></div>
              <Button onClick={runOptimizer} disabled={running} className="optimizer-run mt-5 h-12 w-full rounded-2xl shadow-lg shadow-violet-200/60">
                {running ? <><Loader2 className="size-4 animate-spin" /> Thinking...</> : <><WandSparkles className="size-4" /> Optimize my budget <span className="button-spark">✦</span></>}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0">
          {!result && !running && (
            <div className="optimizer-empty decision-empty">
              <div className="decision-visual">
                <div className="decision-core"><Sparkles className="size-6" /></div>
                <span className="decision-pulse pulse-a" /><span className="decision-pulse pulse-b" />
              </div>
              <p className="section-kicker">READY WHEN YOU ARE</p>
              <h3>Let the math meet the mission.</h3>
              <p>Pick a strategy and a ceiling. RiskOpt will turn the trade-offs into one clear recommendation.</p>
              <div className="empty-pill-row"><span>risk impact</span><span>cost efficiency</span><span>coverage</span></div>
            </div>
          )}

          {running && (
            <div className="optimizer-empty decision-empty">
              <div className="decision-visual thinking"><div className="decision-core"><Loader2 className="size-6 animate-spin" /></div><span className="decision-pulse pulse-a" /><span className="decision-pulse pulse-b" /></div>
              <p className="section-kicker">OPTIMIZATION IN PROGRESS</p>
              <h3>Testing the trade-offs<span className="thinking-dots">...</span></h3>
              <p>Evaluating protection combinations against {org.name}&rsquo;s budget and chosen objective.</p>
              <div className="thinking-bar"><span /></div>
            </div>
          )}

          {result && !running && (
            <div className="flex flex-col gap-5">
              <Card className="impact-card overflow-hidden">
                <div className="impact-wash" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="section-kicker">03 · OUTCOME</p><CardTitle className="mt-1 text-2xl">Your money has a job now.</CardTitle></div>
                    <span className="result-badge"><span /> OPTIMIZED PLAN</span>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
                    <div className="impact-side result-reveal"><RiskGauge score={result.riskBefore} size={142} strokeWidth={10} label="before" /><span className="impact-caption">Current posture</span></div>
                    <div className="outcome-arrow"><ArrowDownRight className="size-7" /><span>risk reshaped</span></div>
                    <div className="impact-side result-reveal result-reveal-late"><RiskGauge score={result.riskAfter} size={142} strokeWidth={10} label="after" /><span className="impact-caption success">Projected posture</span></div>
                  </div>
                  <div className="impact-metrics">
                    <div><span>Risk reduction</span><strong>-{result.percentReduction}%</strong></div>
                    <div><span>Exposure avoided</span><strong>{formatINRShort(result.exposureReduced)}</strong></div>
                    <div><span>Capital deployed</span><strong>{formatINRShort(result.totalInvestment)}</strong></div>
                  </div>
                </CardContent>
              </Card>

              <div className="decision-summary">
                <div className="summary-icon"><Sparkles className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="summary-kicker">RISKOPT&apos;S BEST MOVE</p>
                  <h3>{bestMove ? bestMove.name : "Keep the budget flexible"}</h3>
                  <p>{bestMove ? `Start with ${bestMove.name}: it contributes ${bestMove.riskReduction} risk-reduction points while fitting the ${formatINRShort(budget)} ceiling.` : "No control fits this ceiling yet. Increase the budget to unlock a protection plan."}</p>
                </div>
                <div className="summary-stat"><strong>{selectedControls.length}</strong><span>controls</span></div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
                <Card className="premium-card recommendation-card">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div><p className="section-kicker">04 · RECOMMENDATION</p><CardTitle className="mt-1 text-xl">Recommended investment plan</CardTitle><p className="text-sm text-slate-500">{selectedControls.length} controls selected within {formatINRShort(budget)}.</p></div>
                      <div className="coverage-pill"><span>{coverage}</span> categories covered</div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {selectedControls.map((c, i) => (
                      <div key={c.id} className="plan-row" style={{ animationDelay: `${i * 90}ms` }}>
                        <span className="plan-number">0{i + 1}</span>
                        <span className="plan-check"><Check className="size-4" /></span>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{c.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">Protects {c.protects.join(" · ")}</p>{result.explanations[c.id] && <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500"><Info className="mt-0.5 size-3 shrink-0" />{result.explanations[c.id]}</p>}</div>
                        <div className="text-right"><p className="text-sm font-bold">{formatINRShort(c.cost)}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingDown className="size-3" />-{c.riskReduction}%</p></div>
                      </div>
                    ))}
                    {excludedControls.length > 0 && <details className="excluded-details"><summary><ChevronDown className="size-3.5" /> See what didn&apos;t make the cut ({excludedControls.length})</summary><p>{excludedControls.map((c) => c.name).join(" · ")}</p></details>}
                  </CardContent>
                </Card>

                <Card className="premium-card mix-card">
                  <CardHeader><p className="section-kicker">CAPITAL MIX</p><CardTitle className="mt-1 text-lg">Where the money goes</CardTitle></CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <DonutChart slices={[...selectedControls.map((c, i) => ({ label: c.name, value: c.cost, color: DONUT_COLORS[i % DONUT_COLORS.length] })), ...(result.remainingBudget > 0 ? [{ label: "Unspent", value: result.remainingBudget, color: "text-slate-300" }] : [])]} centerValue={formatINRShort(result.totalInvestment)} centerLabel="allocated" />
                    <div className="w-full space-y-2">
                      {selectedControls.map((c, i) => <div key={c.id} className="flex items-center gap-2 text-xs"><span className={cn("size-2.5 rounded-full bg-current", DONUT_COLORS[i % DONUT_COLORS.length])} /><span className="flex-1 truncate text-slate-500">{c.name}</span><span className="font-semibold tabular-nums">{formatINRShort(c.cost)}</span></div>)}
                      <div className="flex items-center gap-2 border-t border-slate-100 pt-2 text-xs"><Wallet className="size-3 text-slate-400" /><span className="flex-1 text-slate-500">Unspent</span><span className="font-semibold">{formatINRShort(Math.max(0, result.remainingBudget))}</span></div>
                    </div>
                    <div className="capital-progress"><div><span>Budget utilized</span><strong>{budgetUsedPct}%</strong></div><div className="capital-track"><span style={{ width: `${budgetUsedPct}%` }} /></div></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
