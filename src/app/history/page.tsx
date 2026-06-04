"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAnonymousUserId } from "@/lib/utils/anonymous-user";
import { GreenAgentSession } from "@/types/greenagent";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Zap, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<GreenAgentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = getAnonymousUserId();
      try {
        const res = await fetch(`/api/history?anonymousUserId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (e) {
        console.error("Failed to load history list:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const averageFocus = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length)
    : 0;

  const averageCarbon = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + s.carbonScore, 0) / sessions.length)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-emerald-400">
          Session History Log
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Overview of your historical focus score achievements and carbon offsets.
        </p>
      </div>

      {/* Summary metric dashboards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Average Focus Score</span>
              <span className="text-2xl font-black text-sky-400">{averageFocus} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
            </div>
            <Zap className="h-8 w-8 text-sky-400/40 shrink-0" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Average Sustainability Score</span>
              <span className="text-2xl font-black text-emerald-400">{averageCarbon} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
            </div>
            <Leaf className="h-8 w-8 text-emerald-400/40 shrink-0" />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-900/20 border border-slate-800/80 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
          <HelpCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h4 className="font-bold text-slate-300">No sessions recorded yet</h4>
          <p className="text-slate-505 text-xs mt-1 max-w-xs mx-auto text-slate-400">
            Run your first digital habit analysis to monitor focus progress.
          </p>
          <Link href="/">
            <span className="inline-block mt-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-xl transition-all cursor-pointer">
              Start Habits Analysis
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
                      {sess.hedera && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/20">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Logged
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-200 break-words line-clamp-1">
                      Tasks: {sess.tasks}
                    </p>
                    <div className="flex gap-4 text-[11px] text-slate-400">
                      <span>Tabs: <strong className="text-slate-300">{sess.tabs}</strong></span>
                      <span>Hours: <strong className="text-slate-300">{sess.hours}h</strong></span>
                      {sess.mode && <span>Mode: <strong className="text-slate-300">{sess.mode}</strong></span>}
                    </div>
                  </div>

                  <div className="flex gap-4 self-end sm:self-center shrink-0">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Focus</span>
                      <span className="font-extrabold text-sky-400 font-mono text-base">{sess.focusScore}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Carbon</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-base">{sess.carbonScore}</span>
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
