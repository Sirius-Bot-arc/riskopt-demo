"use client"

import { BrainCircuit, ChevronRight, Sparkles } from "lucide-react"
import { useAppState } from "@/lib/app-state"
import { formatINRShort, getOverview } from "@/lib/data"
import { useNav } from "@/components/nav-context"

export function RiskOptIntelligence({ compact=false }: { compact?: boolean }) {
  const { org, budget, result } = useAppState()
  const { setView, openRisk } = useNav()
  const overview = getOverview(org)
  const top = [...org.risks].sort((a,b)=>b.score-a.score)[0]
  const topControl = org.controls.find(c => top?.recommendedControls.includes(c.id))
  const text = result
    ? `Your latest plan reduces estimated exposure by ${formatINRShort(result.exposureReduced)} while investing ${formatINRShort(result.totalInvestment)}.`
    : `${top?.name ?? "Your highest risk"} is currently the biggest impact opportunity. ${topControl ? `${topControl.name} is one of the strongest controls to consider within your ${formatINRShort(budget)} budget.` : "Run the optimizer to identify the strongest investment mix."}`
  return <div className={`relative overflow-hidden rounded-[1.5rem] border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-sky-50 ${compact?"p-4":"p-5"}`}>
    <div className="absolute -right-10 -top-10 size-28 rounded-full bg-violet-200/40 blur-2xl"/>
    <div className="relative flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><BrainCircuit className="size-5"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">RiskOpt Intelligence</p><Sparkles className="size-3.5 text-violet-500"/></div><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>{!compact&&<div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/80 px-2.5 py-1 font-medium text-slate-600">Risk {overview.overallRisk}/100</span><span className="rounded-full bg-white/80 px-2.5 py-1 font-medium text-slate-600">{formatINRShort(overview.exposure)} exposure</span></div>}</div>{!compact&&top&&<button onClick={()=>openRisk(top.id)} className="hidden shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 sm:flex">Inspect<ChevronRight className="size-3.5"/></button>}</div>
  </div>
}
