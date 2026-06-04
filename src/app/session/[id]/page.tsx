"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { GreenAgentSession } from "@/types/greenagent";
import ScoreCard from "@/components/score-card";
import AgentInsights from "@/components/agent-insights";
import RecommendationCard from "@/components/recommendation-card";
import HederaConfirmation from "@/components/hedera-confirmation";
import { ArrowLeft, Clock, BrainCircuit, ShieldAlert } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [session, setSession] = useState<GreenAgentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const res = await fetch(`/api/session/${resolvedParams.id}`);
        if (res.ok) {
          const data: GreenAgentSession = await res.json();
          setSession(data);
          if (data.recommendations && data.recommendations.length > 0) {
            const loggedRec = data.selectedAction
              ? data.recommendations.find(r => r.title === data.selectedAction?.title)
              : null;
            setSelectedActionId(loggedRec?.id || data.recommendations[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load details:", e);
      } finally {
        setIsLoading(false);
      }
    };
    getSessionData();
  }, [resolvedParams.id]);

  const handleLogAction = async () => {
    if (!session || !selectedActionId) return;
    setIsLogging(true);
    setError("");
    try {
      const res = await fetch("/api/hedera/log-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, actionId: selectedActionId })
      });
      if (!res.ok) {
        throw new Error("Hedera Logging operation rejected.");
      }
      const data: GreenAgentSession = await res.json();
      setSession(data);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "Failed to record green action logs to Hedera HCS.";
      setError(errMsg);
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-900/20 rounded-xl" />
        <div className="h-32 bg-slate-900/20 rounded-2xl" />
        <div className="h-40 bg-slate-900/20 rounded-2xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h4 className="font-bold text-slate-300">Session not found</h4>
        <p className="text-slate-500 text-xs mt-1">This report could not be retrieved from database records.</p>
        <Link href="/history" className="inline-block mt-4 text-xs font-bold text-emerald-400 hover:underline">
          Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <Link href="/history" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to history</span>
        </Link>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">
            Session Logged: {new Date(session.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-200 rounded-2xl text-sm flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          title="Productivity Focus Score"
          score={session.focusScore}
          type="focus"
          description={`Work mode style parameter is logged as ${session.mode || "Standard"}.`}
        />
        <ScoreCard
          title="Digital Carbon Score"
          score={session.carbonScore}
          type="carbon"
          description="Computed baseline based on browser tabs density and estimated screen display uptime parameters."
        />
      </div>

      {/* Detailed agent insights */}
      <AgentInsights context={session.agents.contextAnalyzer} carbon={session.agents.carbonEstimator} />

      {/* Best Action Spotlight */}
      <div className="bg-slate-900/20 border border-slate-800/80 p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-slate-200">Recommended Primary Green Action</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-emerald-400">{session.bestAction.bestActionTitle}</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Why:</strong> {session.bestAction.bestActionReason}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Expected Outcome:</strong> {session.bestAction.expectedOutcome}
          </p>
        </div>
      </div>

      {/* Complete recommendations list */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-200">Action Plan Recommendations</h3>
        <div className="grid grid-cols-1 gap-4">
          {session.recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              isSelected={selectedActionId === rec.id}
              onSelect={() => setSelectedActionId(rec.id)}
              onLog={handleLogAction}
              isLogging={isLogging}
              isLogged={!!session.selectedAction && session.selectedAction.title === rec.title}
            />
          ))}
        </div>
      </div>

      {/* Hedera confirmation log */}
      {session.hedera && (
        <HederaConfirmation
          topicId={session.hedera.topicId || ""}
          transactionId={session.hedera.transactionId || ""}
          consensusTimestamp={session.hedera.consensusTimestamp || ""}
          status={session.hedera.status}
        />
      )}
    </div>
  );
}
