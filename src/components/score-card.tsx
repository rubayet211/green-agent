"use client";

import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Zap, Leaf } from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  type: "focus" | "carbon";
}

export default function ScoreCard({ title, score, description, type }: ScoreCardProps) {
  const isFocus = type === "focus";
  const gradient = isFocus ? "from-sky-500 to-indigo-500" : "from-emerald-500 to-teal-500";
  const textGlow = isFocus ? "text-sky-400" : "text-emerald-400";
  const Icon = isFocus ? Zap : Leaf;

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
      {/* Background neon glows */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 ${isFocus ? "bg-sky-500" : "bg-emerald-500"}`} />

      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/50 ${textGlow}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-4xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {score}
        </span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>

      <Progress value={score} className="flex flex-col gap-1 w-full">
        <ProgressTrack className="h-2 bg-slate-800 w-full rounded-full">
          <ProgressIndicator className={`h-full rounded-full bg-gradient-to-r ${gradient}`} />
        </ProgressTrack>
      </Progress>

      <p className="mt-3.5 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}
