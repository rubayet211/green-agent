"use client";

import { Cpu, Leaf, Wallet } from "lucide-react";
import { ContextAnalyzerOutput, CarbonCostEstimatorOutput } from "@/types/greenagent";

interface AgentInsightsProps {
  context: ContextAnalyzerOutput;
  carbonCost: CarbonCostEstimatorOutput;
}

export default function AgentInsights({ context, carbonCost }: AgentInsightsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 my-6 lg:grid-cols-2">
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-4">
          <Cpu className="h-5 w-5 text-sky-400" />
          <h2 className="font-bold text-slate-200">Context Analyzer Insight</h2>
          <span className={`ml-auto text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
            context.severity === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            context.severity === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {context.severity} risk
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{context.summary}</p>
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 mb-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-300">
            <Wallet className="h-3.5 w-3.5" />
            Earning risk estimate
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {context.earningRiskExplanation}
          </p>
        </div>
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identified focus risks:</h3>
          <ul className="space-y-1.5">
            {context.focusRisks.map((risk, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-4">
          <Leaf className="h-5 w-5 text-emerald-400" />
          <h2 className="font-bold text-slate-200">Carbon & Cost Estimator</h2>
          <span className={`ml-auto text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
            carbonCost.estimatedImpact === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            carbonCost.estimatedImpact === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {carbonCost.estimatedImpact} impact
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{carbonCost.hiddenCostExplanation}</p>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">{carbonCost.carbonExplanation}</p>
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main hidden-cost drivers:</h3>
          <ul className="space-y-1.5">
            {carbonCost.mainCarbonDrivers.map((driver, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
