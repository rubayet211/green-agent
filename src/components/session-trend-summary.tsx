"use client";

import { buildTrendPolyline } from "@/lib/utils/trends";

interface TrendSeries {
  label: string;
  scores: number[];
  color: "sky" | "emerald";
}

interface SessionTrendSummaryProps {
  series: TrendSeries[];
}

const colorClass = {
  sky: "stroke-sky-300 text-sky-300",
  emerald: "stroke-emerald-300 text-emerald-300",
};

export default function SessionTrendSummary({ series }: SessionTrendSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200">Score Trend</h2>
          <p className="text-xs text-slate-500">Recent sessions, newest on the right.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {series.map((item) => {
          const trend = buildTrendPolyline(item.scores, {
            width: 240,
            height: 72,
            padding: 8,
          });
          const latest = item.scores[item.scores.length - 1] ?? 0;
          const first = item.scores[0] ?? latest;
          const delta = latest - first;

          return (
            <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</h3>
                  <p className={`text-sm font-bold ${colorClass[item.color].split(" ")[1]}`}>
                    {delta >= 0 ? "+" : ""}
                    {delta} over {item.scores.length} session{item.scores.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">
                  {trend.direction}
                </span>
              </div>
              <svg
                viewBox="0 0 240 72"
                role="img"
                aria-label={`${item.label} trend`}
                className="h-20 w-full overflow-visible"
              >
                <line x1="8" y1="64" x2="232" y2="64" className="stroke-slate-800" strokeWidth="1" />
                <line x1="8" y1="8" x2="232" y2="8" className="stroke-slate-800" strokeWidth="1" />
                <polyline
                  points={trend.points}
                  fill="none"
                  className={colorClass[item.color].split(" ")[0]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </section>
  );
}
