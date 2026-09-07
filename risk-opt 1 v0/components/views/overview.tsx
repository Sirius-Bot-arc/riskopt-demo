"use client"

import { AlertTriangle, ArrowRight, ChevronRight, IndianRupee, ShieldAlert, Wallet } from "lucide-react"
import { BarList } from "@/components/charts/bar-list"
import { TrendChart } from "@/components/charts/trend-chart"
import { useNav } from "@/components/nav-context"
import { RiskGauge } from "@/components/risk-gauge"
import { SeverityBadge } from "@/components/severity-badge"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  OVERVIEW,
  RISKS,
  RISK_TREND,
  SEVERITY_ORDER,
  formatINR,
  formatINRShort,
  severityDistribution,
} from "@/lib/data"
import { severityStyle } from "@/lib/severity"

export function Overview() {
  const { openRisk, setView } = useNav()
  const dist = severityDistribution()
  const topRisks = [...RISKS].sort((a, b) => b.score - a.score).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      {/* Hero: overall posture + key stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall Risk Posture</CardTitle>
            <CardDescription>Weighted across all tracked risks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pb-2">
            <RiskGauge score={OVERVIEW.overallRisk} />
            <SeverityBadge severity={OVERVIEW.overallSeverity} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard
            label="Annual Loss Exposure"
            value={formatINRShort(OVERVIEW.exposure)}
            sublabel={formatINR(OVERVIEW.exposure)}
            icon={IndianRupee}
            accent="text-critical"
          />
          <StatCard
            label="Available Budget"
            value={formatINRShort(OVERVIEW.budget)}
            sublabel={formatINR(OVERVIEW.budget)}
            icon={Wallet}
            accent="text-primary"
          />
          <StatCard
            label="Critical Risks"
            value={String(OVERVIEW.criticalRisks)}
            sublabel="Require immediate attention"
            icon={AlertTriangle}
            accent="text-critical"
          />
          <StatCard
            label="Risk Score Trend"
            value="76"
            sublabel="Down from 81 in March"
            icon={ShieldAlert}
            accent="text-success"
            trend={{ value: -5, goodDirection: "down" }}
          />
        </div>
      </div>

      {/* Distribution + Top risks */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Risks by severity band</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={SEVERITY_ORDER.map((sev) => ({
                label: sev,
                value: dist[sev],
                color: severityStyle(sev).fill,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Risks</CardTitle>
            <CardDescription>Highest-scoring risks across the organization</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {topRisks.map((risk) => {
              const s = severityStyle(risk.severity)
              return (
                <button
                  key={risk.id}
                  type="button"
                  onClick={() => openRisk(risk.id)}
                  className="group flex items-center gap-4 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent"
                >
                  <span className={`w-10 text-lg font-semibold tabular-nums ${s.text}`}>
                    {risk.score}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{risk.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {risk.category} · {formatINRShort(risk.exposure)} exposure
                    </p>
                  </div>
                  <SeverityBadge severity={risk.severity} />
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Trend + CTA */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Score Over Time</CardTitle>
            <CardDescription>Overall weighted risk score, last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={RISK_TREND} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
          <CardContent className="relative flex h-full flex-col justify-between gap-6 py-2">
            <div className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <ShieldAlert className="size-5" />
              </span>
              <h3 className="text-lg font-semibold text-balance">Turn your budget into risk reduction</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Let the optimizer choose the controls that cut the most risk within your{" "}
                {formatINRShort(OVERVIEW.budget)} budget.
              </p>
            </div>
            <Button onClick={() => setView("optimizer")} className="w-full">
              Optimize Security Budget
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
