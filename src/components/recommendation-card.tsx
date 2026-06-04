"use client";

import { Recommendation } from "@/types/greenagent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Zap } from "lucide-react";

interface RecommendationCardProps {
  recommendation: Recommendation;
  isSelected: boolean;
  onSelect: () => void;
  onLog: () => void;
  isLogging: boolean;
  isLogged: boolean;
}

export default function RecommendationCard({
  recommendation,
  isSelected,
  onSelect,
  onLog,
  isLogging,
  isLogged,
}: RecommendationCardProps) {
  return (
    <Card
      className={`bg-slate-900/40 backdrop-blur-md border-slate-800 transition-all shadow-md relative overflow-hidden ${
        isSelected ? "ring-2 ring-emerald-400 bg-slate-900/60" : "hover:border-slate-700"
      }`}
    >
      <CardContent className="p-0">
        <button
          type="button"
          aria-pressed={isSelected}
          onClick={onSelect}
          className="w-full space-y-4 p-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
            <h3 className="font-bold text-slate-100">{recommendation.title}</h3>
            <div className="flex gap-2 shrink-0">
              <span
                className={`text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full ${
                  recommendation.difficulty === "easy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : recommendation.difficulty === "medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {recommendation.difficulty}
              </span>
              <span className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold border border-slate-800">
                Impact: {recommendation.impact}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">{recommendation.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
            <div className="flex items-start gap-2">
              <Zap className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] block font-bold text-sky-400 uppercase tracking-wider">
                  Productivity
                </span>
                <span className="text-xs text-slate-300 leading-tight block">
                  {recommendation.productivityBenefit}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Leaf className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] block font-bold text-emerald-400 uppercase tracking-wider">
                  Sustainability
                </span>
                <span className="text-xs text-slate-300 leading-tight block">
                  {recommendation.sustainabilityBenefit}
                </span>
              </div>
            </div>
          </div>
        </button>

        {isSelected && (
          <div className="px-6 pb-6">
            <Button
              size="sm"
              onClick={onLog}
              disabled={isLogging || isLogged}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg"
            >
              {isLogging
                ? "Logging to Hedera..."
                : isLogged
                  ? "Action already processed"
                  : "Log as Green Action on Hedera"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
