"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureAnonymousIdentity } from "@/lib/utils/anonymous-user";
import { GreenAgentSession } from "@/types/greenagent";
import { formatMoneyEstimate } from "@/lib/utils/score";
import { Card, CardContent } from "@/components/ui/card";
import SessionTrendSummary from "@/components/session-trend-summary";
import { Zap, Clock, ShieldCheck, HelpCircle, AlertTriangle, FlaskConical, ReceiptText, Wallet } from "lucide-react";

async function requestHistory(): Promise<GreenAgentSession[]> {
  await ensureAnonymousIdentity();
  const response = await fetch("/api/history");
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Unable to load session history.");
  }
  return response.json();
}

function getHiddenCostScore(session: GreenAgentSession): number {
  return session.hiddenCostScore ?? session.carbonScore ?? 0;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<GreenAgentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setIsLoading(true);
    setError("");
    try {
      setSessions(await requestHistory());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load session history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void requestHistory()
      .then((history) => {
        if (active) setSessions(history);
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Unable to load session history.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const averageFocus = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length)
    : 0;

  const averageHiddenCost = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + getHiddenCostScore(s), 0) / sessions.length)
    : 0;
  const totalRevenueLoss = sessions.reduce((acc, s) => acc + (s.estimatedRevenueLoss ?? 0), 0);
  const totalRecoveredOpportunity = sessions.reduce(
    (acc, s) => acc + (s.selectedAction?.estimatedFinancialBenefit ?? 0),
    0,
  );
  const milestoneCount = sessions.filter((s) => s.hedera?.actionType === "SUSTAINABLE_WORK_MILESTONE" || s.hedera?.status === "success" || s.hedera?.status === "simulated").length;
  const latest = sessions[0];
  const oldest = sessions[sessions.length - 1];
  const focusTrend = latest && oldest ? latest.focusScore - oldest.focusScore : 0;
  const hiddenCostTrend = latest && oldest ? getHiddenCostScore(latest) - getHiddenCostScore(oldest) : 0;
  const chronologicalSessions = [...sessions].reverse();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-emerald-400">
          Work Session History
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Review focus, hidden-cost trend, and Sustainable Work Milestones over time.
        </p>
      </div>

      {/* Summary metric dashboards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Average Focus Score</span>
              <span className="text-2xl font-black text-sky-400">{averageFocus} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
              <span className="mt-1 block text-[10px] text-slate-500">{focusTrend >= 0 ? "+" : ""}{focusTrend} vs oldest</span>
            </div>
            <Zap className="h-8 w-8 text-sky-400/40 shrink-0" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Average Hidden Cost Score</span>
              <span className="text-2xl font-black text-emerald-400">{averageHiddenCost} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
              <span className="mt-1 block text-[10px] text-slate-500">{hiddenCostTrend >= 0 ? "+" : ""}{hiddenCostTrend} vs oldest</span>
            </div>
            <ReceiptText className="h-8 w-8 text-emerald-400/40 shrink-0" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Estimated Revenue Loss</span>
              <span className="text-2xl font-black text-amber-300">{formatMoneyEstimate(totalRevenueLoss, sessions[0]?.currency ?? "USD")}</span>
            </div>
            <Wallet className="h-8 w-8 text-amber-300/40 shrink-0" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Milestones Logged</span>
              <span className="text-2xl font-black text-emerald-300">{milestoneCount}</span>
              <span className="mt-1 block text-[10px] text-slate-500">
                {formatMoneyEstimate(totalRecoveredOpportunity, sessions[0]?.currency ?? "USD")} opportunity logged
              </span>
            </div>
            <ShieldCheck className="h-8 w-8 text-emerald-300/40 shrink-0" />
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <SessionTrendSummary
          series={[
            {
              label: "Focus Score",
              scores: chronologicalSessions.map((session) => session.focusScore),
              color: "sky",
            },
            {
              label: "Hidden Cost Score",
              scores: chronologicalSessions.map(getHiddenCostScore),
              color: "emerald",
            },
          ]}
        />
      )}

      {error ? (
        <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
          <h2 className="mt-3 font-bold text-red-200">History could not be loaded</h2>
          <p className="mt-1 text-sm text-red-200/80">{error}</p>
          <button
            type="button"
            onClick={() => void fetchHistory()}
            className="mt-4 rounded-lg bg-red-200 px-4 py-2 text-sm font-bold text-red-950"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-900/20 border border-slate-800/80 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
          <HelpCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h2 className="font-bold text-slate-300">No sessions recorded yet</h2>
          <p className="text-xs mt-1 max-w-xs mx-auto text-slate-400">
            Run your first freelancer work session analysis to monitor focus and hidden-cost progress.
          </p>
          <Link href="/">
            <span className="inline-block mt-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-xl transition-all cursor-pointer">
              Analyze Work Session
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => (
            <Link href={`/session/${sess.id}`} key={sess.id} className="block">
              <Card className="bg-slate-900/30 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/50 transition-all cursor-pointer">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(sess.timestamp).toLocaleDateString()} at {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {sess.hedera?.status === "success" && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          Hedera confirmed
                        </span>
                      )}
                      {sess.hedera?.status === "simulated" && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full font-bold uppercase border border-sky-500/20">
                          <FlaskConical className="h-3 w-3" />
                          Simulated
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-200 break-words line-clamp-1">
                      Tasks: {sess.tasks}
                    </p>
                    <p className="text-xs text-emerald-300/80 line-clamp-1">
                      Best milestone: {sess.bestAction.bestActionTitle}
                    </p>
                    <div className="flex gap-4 text-[11px] text-slate-400">
                      <span>Tabs: <strong className="text-slate-300">{sess.tabs}</strong></span>
                      <span>Hours: <strong className="text-slate-300">{sess.hours}h</strong></span>
                      {sess.mode && <span>Mode: <strong className="text-slate-300">{sess.mode}</strong></span>}
                      <span>Loss: <strong className="text-slate-300">{formatMoneyEstimate(sess.estimatedRevenueLoss ?? 0, sess.currency ?? "USD")}</strong></span>
                    </div>
                  </div>

                  <div className="flex gap-4 self-end sm:self-center shrink-0">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Focus</span>
                      <span className="font-extrabold text-sky-400 font-mono text-base">{sess.focusScore}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Hidden Cost</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-base">{getHiddenCostScore(sess)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
