"use client";

import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Zap, ReceiptText } from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  type: "focus" | "hidden-cost";
  estimates?: Array<{ label: string; value: string }>;
}

export default function ScoreCard({ title, score, description, type, estimates = [] }: ScoreCardProps) {
  const isFocus = type === "focus";
  const gradient = isFocus ? "from-sky-400 to-cyan-300" : "from-emerald-400 to-lime-300";
  const textGlow = isFocus ? "text-sky-300" : "text-emerald-300";
  const Icon = isFocus ? Zap : ReceiptText;
  const interpretation = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs attention";
  const direction = isFocus
    ? "Higher means stronger earning focus."
    : "Higher means lower estimated hidden cost.";

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl relative overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-700/50 ${textGlow}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-4xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {score}
        </span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>

      <Progress
        value={score}
        aria-label={`${title}: ${score} out of 100`}
        className="flex flex-col gap-1 w-full"
      >
        <ProgressTrack className="h-2 bg-slate-800 w-full rounded-full">
          <ProgressIndicator className={`h-full rounded-full bg-gradient-to-r ${gradient}`} />
        </ProgressTrack>
      </Progress>

      <p className={`mt-3 text-xs font-semibold ${textGlow}`}>
        {interpretation}. {direction}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        {description}
      </p>

      {estimates.length > 0 && (
        <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-800 pt-4 sm:grid-cols-2">
          {estimates.map((item) => (
            <div key={item.label} className="rounded-lg bg-slate-950/50 p-3">
              <dt className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-sm font-bold text-slate-100">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
