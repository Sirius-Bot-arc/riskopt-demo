// Deterministic investment optimization engine.
//
// Given an organization, an available budget, and an objective, this computes
// which security controls to recommend. Same org + budget + objective always
// produces the same result — no randomness anywhere in this file.

import { getOverview, type Control, type Objective, type Organization } from "@/lib/data"

export interface OptimizationResult {
  controlIds: string[]
  excludedIds: string[]
  totalInvestment: number
  remainingBudget: number
  expectedReduction: number
  percentReduction: number
  riskBefore: number
  riskAfter: number
  exposureBefore: number
  exposureAfter: number
  exposureReduced: number
  explanations: Record<string, string>
}

const BUDGET_UNIT = 10000 // ₹10,000 buckets for the knapsack DP

// Objective A — Maximum Risk Reduction: classic 0/1 knapsack maximizing the
// sum of risk-reduction points achievable within budget.
function selectMaxReduction(controls: Control[], budget: number): Control[] {
  const cap = Math.max(0, Math.floor(budget / BUDGET_UNIT))
  const n = controls.length
  const weights = controls.map((c) => Math.round(c.cost / BUDGET_UNIT))
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1]
    const value = controls[i - 1].riskReduction
    for (let c = 0; c <= cap; c++) {
      dp[i][c] = dp[i - 1][c]
      if (w <= c) {
        const candidate = dp[i - 1][c - w] + value
        if (candidate > dp[i][c]) dp[i][c] = candidate
      }
    }
  }

  const selected: Control[] = []
  let c = cap
  for (let i = n; i >= 1; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      selected.push(controls[i - 1])
      c -= weights[i - 1]
    }
  }
  // Restore original catalog order for stable, readable output.
  return controls.filter((ctrl) => selected.includes(ctrl))
}

// Objective B — Best Value for Money: greedily take the controls with the
// strongest risk-reduction-per-rupee ratio that still fit the remaining budget.
function selectBestValue(controls: Control[], budget: number): Control[] {
  const ranked = [...controls].sort((a, b) => {
    const ra = a.riskReduction / a.cost
    const rb = b.riskReduction / b.cost
    if (rb !== ra) return rb - ra
    return a.id.localeCompare(b.id)
  })
  const selected: Control[] = []
  let remaining = budget
  for (const control of ranked) {
    if (control.cost <= remaining) {
      selected.push(control)
      remaining -= control.cost
    }
  }
  return controls.filter((ctrl) => selected.includes(ctrl))
}

// Objective C — Balanced: iteratively pick the control with the best blended
// score of normalized risk reduction, normalized efficiency, and a bonus for
// covering a risk category not yet addressed by the plan.
function selectBalanced(controls: Control[], budget: number): Control[] {
  const maxReduction = Math.max(...controls.map((c) => c.riskReduction), 1)
  const maxEfficiency = Math.max(...controls.map((c) => c.riskReduction / c.cost), 1e-9)

  const selected: Control[] = []
  const coveredCategories = new Set<string>()
  let remaining = budget

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let best: Control | null = null
    let bestScore = -Infinity

    for (const control of controls) {
      if (selected.includes(control)) continue
      if (control.cost > remaining) continue

      const normReduction = control.riskReduction / maxReduction
      const normEfficiency = control.riskReduction / control.cost / maxEfficiency
      const coverageBonus = coveredCategories.has(control.category) ? 0 : 1
      const score = normReduction * 0.5 + normEfficiency * 0.3 + coverageBonus * 0.2

      if (score > bestScore + 1e-9 || (Math.abs(score - bestScore) <= 1e-9 && (!best || control.id < best.id))) {
        bestScore = score
        best = control
      }
    }

    if (!best) break
    selected.push(best)
    coveredCategories.add(best.category)
    remaining -= best.cost
  }

  return controls.filter((ctrl) => selected.includes(ctrl))
}

function explain(control: Control, objective: Objective): string {
  const perLakh = (control.riskReduction / (control.cost / 100000)).toFixed(1)
  if (objective === "max-reduction") {
    return `${control.name} selected because it contributes -${control.riskReduction} pts of overall risk reduction, one of the largest absolute gains available within budget.`
  }
  if (objective === "best-value") {
    return `${control.name} selected because it returns ${perLakh} risk-reduction points per ₹1L spent — the strongest cost-to-impact ratio in the plan.`
  }
  return `${control.name} selected because it pairs a solid -${control.riskReduction} pt reduction (${perLakh} pts/₹1L) with coverage of the ${control.category} risk category.`
}

export function runOptimization(org: Organization, budget: number, objective: Objective): OptimizationResult {
  const overview = getOverview(org)
  const safeBudget = Math.max(0, budget)

  let selected: Control[]
  if (objective === "max-reduction") selected = selectMaxReduction(org.controls, safeBudget)
  else if (objective === "best-value") selected = selectBestValue(org.controls, safeBudget)
  else selected = selectBalanced(org.controls, safeBudget)

  const totalInvestment = selected.reduce((sum, c) => sum + c.cost, 0)
  const rawReduction = selected.reduce((sum, c) => sum + c.riskReduction, 0)
  const riskBefore = overview.overallRisk

  // Security controls overlap, have imperfect coverage, and cannot eliminate
  // enterprise cyber risk completely. Convert the catalog's control-level
  // points into a more realistic portfolio-level effect with diminishing
  // returns as more controls are stacked.
  const portfolioEffectiveness = Math.max(0.48, 0.70 - rawReduction * 0.001)
  const effectiveReduction = rawReduction * portfolioEffectiveness
  const minimumResidualRisk = Math.max(20, Math.round(riskBefore * 0.24))
  const riskAfter = Math.max(
    minimumResidualRisk,
    Math.round(riskBefore - effectiveReduction),
  )
  const expectedReduction = riskBefore - riskAfter
  const percentReduction = riskBefore > 0 ? Math.round((expectedReduction / riskBefore) * 100) : 0

  const rawExposureCut = selected.reduce((sum, c) => sum + c.exposureReduction, 0)
  const exposureBefore = overview.exposure
  const exposureFloor = Math.round(exposureBefore * 0.05)
  const exposureAfter = Math.max(exposureFloor, exposureBefore - rawExposureCut)
  const exposureReduced = exposureBefore - exposureAfter

  const explanations: Record<string, string> = {}
  for (const control of selected) explanations[control.id] = explain(control, objective)

  return {
    controlIds: selected.map((c) => c.id),
    excludedIds: org.controls.filter((c) => !selected.includes(c)).map((c) => c.id),
    totalInvestment,
    remainingBudget: Math.max(0, safeBudget - totalInvestment),
    expectedReduction,
    percentReduction,
    riskBefore,
    riskAfter,
    exposureBefore,
    exposureAfter,
    exposureReduced,
    explanations,
  }
}
