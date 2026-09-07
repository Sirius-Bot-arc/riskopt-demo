"use client"

import { Check, ShieldCheck, TrendingDown } from "lucide-react"
import { useNav } from "@/components/nav-context"
import { BarList } from "@/components/charts/bar-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CONTROLS, getControl, formatINR, formatINRShort } from "@/lib/data"

export function SecurityControls() {
  const { controlId, openControl, clearControl, setView } = useNav()
  const active = controlId ? getControl(controlId) : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="lg:w-2/3">
          <CardHeader>
            <CardTitle>Available Controls</CardTitle>
            <CardDescription>
              Each control reduces overall risk by a set amount for a fixed investment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={[...CONTROLS]
                .sort((a, b) => b.riskReduction - a.riskReduction)
                .map((c) => ({
                  label: c.name,
                  value: c.riskReduction,
                  display: `-${c.riskReduction}%`,
                  color: "bg-primary",
                }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle>Ready to allocate?</CardTitle>
            <CardDescription>Compare these controls against your budget.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              The optimizer selects the best mix of controls to maximize risk reduction within your
              available budget.
            </p>
            <Button onClick={() => setView("optimizer")} variant="secondary">
              Go to Optimizer
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTROLS.map((control) => (
          <Card key={control.id} className="group transition-colors hover:border-primary/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
                  <TrendingDown className="size-3" />-{control.riskReduction}%
                </span>
              </div>
              <CardTitle className="mt-2 text-base">{control.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">{control.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold tabular-nums">{formatINRShort(control.cost)}</p>
                  <p className="text-xs text-muted-foreground">one-time investment</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openControl(control.id)}>
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && clearControl()}>
        <DialogContent className="sm:max-w-md">
          {active && (
            <>
              <DialogHeader>
                <div className="mb-1 flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <DialogTitle>{active.name}</DialogTitle>
                <DialogDescription>{active.description}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Investment</p>
                  <p className="mt-1 text-lg font-semibold">{formatINR(active.cost)}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Reduction</p>
                  <p className="mt-1 text-lg font-semibold text-success">-{active.riskReduction}%</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Protects against</p>
                <ul className="flex flex-col gap-2">
                  {active.protects.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
