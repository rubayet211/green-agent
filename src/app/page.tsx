"use client";

import { useEffect, useState } from "react";
import { getAnonymousUserId } from "@/lib/utils/anonymous-user";
import { GreenAgentSession } from "@/types/greenagent";
import AnalysisForm from "@/components/analysis-form";
import AnalysisLoading from "@/components/analysis-loading";
import ScoreCard from "@/components/score-card";
import AgentInsights from "@/components/agent-insights";
import RecommendationCard from "@/components/recommendation-card";
import HederaConfirmation from "@/components/hedera-confirmation";
import { Sparkles, BrainCircuit, ShieldAlert } from "lucide-react";

export default function Home() {
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<GreenAgentSession | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string>("");
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const anonymousId = getAnonymousUserId();
    setTimeout(() => {
      setUserId(anonymousId);
    }, 0);
  }, []);

  const handleFormSubmit = async (inputData: { tabs: number; hours: number; tasks: string; mode: string }) => {
    setIsLoading(true);
    setError("");
    setSession(null);
    setSelectedActionId("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputData, anonymousUserId: userId })
      });
      if (!res.ok) {
        throw new Error("Unable to run digital analysis.");
      }
      const data: GreenAgentSession = await res.json();
      setSession(data);
      if (data.recommendations && data.recommendations.length > 0) {
        setSelectedActionId(data.recommendations[0].id);
      }
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "GreenAgent could not complete the analysis. Please check your API setup and try again.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
        throw new Error("Hedera Consensus Service logging transaction failed.");
      }
      const data: GreenAgentSession = await res.json();
      setSession(data);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "Failed to record green action logs to Hedera. Try again.";
      setError(errMsg);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Beyond Tomorrow Summit 2026 Hackathon Entry</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-emerald-400 to-sky-400">
          GreenAgent Copilot
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Get more focused work done while reducing your digital carbon footprint. An orchestrated multi-agent reasoning system logging proofs on Hedera HCS.
        </p>
      </section>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-200 rounded-2xl text-sm flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Action input form */}
      {!isLoading && !session && (
        <AnalysisForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}

      {/* Loading state indicator */}
      {isLoading && <AnalysisLoading />}

      {/* Results layout */}
      {session && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard
              title="Productivity Focus Score"
              score={session.focusScore}
              type="focus"
              description={`Analyzed for ${session.mode} work style. Multitasking and screen time parameters calculated.`}
            />
            <ScoreCard
              title="Digital Carbon Score"
              score={session.carbonScore}
              type="carbon"
              description="Reflects server network loads, active display states, and computational energy demands."
            />
          </div>

          {/* Detailed agent insights */}
          <AgentInsights context={session.agents.contextAnalyzer} carbon={session.agents.carbonEstimator} />

          {/* Best action recommendation showcase */}
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

          {/* Hedera logger outputs */}
          {session.hedera && (
            <HederaConfirmation
              topicId={session.hedera.topicId || ""}
              transactionId={session.hedera.transactionId || ""}
              consensusTimestamp={session.hedera.consensusTimestamp || ""}
              status={session.hedera.status}
            />
          )}

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setSession(null)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline font-medium transition-colors"
            >
              Analyze Another Habit Block
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
