"use client";

import { useState } from "react";
import { ensureAnonymousIdentity } from "@/lib/utils/anonymous-user";
import { formatMoneyEstimate } from "@/lib/utils/score";
import { Currency, GreenAgentSession, WorkMode } from "@/types/greenagent";
import AnalysisForm from "@/components/analysis-form";
import AnalysisLoading from "@/components/analysis-loading";
import ScoreCard from "@/components/score-card";
import AgentInsights from "@/components/agent-insights";
import RecommendationCard from "@/components/recommendation-card";
import HederaConfirmation from "@/components/hedera-confirmation";
import { Sparkles, BrainCircuit, ShieldAlert, Info } from "lucide-react";

interface AnalysisInput {
  tabs: number;
  hours: number;
  tasks: string;
  mode: WorkMode;
  hourlyRate?: number;
  billablePercentage?: number;
  currency: Currency;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<GreenAgentSession | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string>("");
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState("");

  const handleFormSubmit = async (inputData: AnalysisInput) => {
    setIsLoading(true);
    setError("");
    setSession(null);
    setSelectedActionId("");

    try {
      await ensureAnonymousIdentity();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Unable to analyze this work session.");
      }
      const data: GreenAgentSession = await res.json();
      setSession(data);
      if (data.recommendations && data.recommendations.length > 0) {
        setSelectedActionId(data.recommendations[0].id);
      }
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "GreenAgent could not estimate this work session. Please check setup and try again.";
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
      await ensureAnonymousIdentity();
      const res = await fetch("/api/hedera/log-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, actionId: selectedActionId })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Sustainable Work Milestone logging failed.");
      }
      const data: GreenAgentSession = await res.json();
      setSession(data);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "Failed to record Sustainable Work Milestone to Hedera. Try again.";
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
          <span>Freelancer earning optimization + sustainable work</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-emerald-400 to-sky-400">
          GreenAgent
        </h1>
        <p className="text-slate-200 text-xl sm:text-2xl font-semibold max-w-2xl mx-auto">
          Earn more from your focused hours. Reduce digital waste while you work.
        </p>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          GreenAgent analyzes your tabs, screen time, and work tasks to estimate hidden productivity costs, then gives AI-powered actions to recover focus, protect earning potential, and work more sustainably.
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
          {session.analysisSource === "fallback" && (
            <div className="flex items-start gap-3 rounded-xl border border-sky-800/50 bg-sky-950/20 p-4 text-sm text-sky-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Gemini is not configured or did not return valid output. These results use GreenAgent&apos;s deterministic local fallback.
              </p>
            </div>
          )}
          {/* Summary statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard
              title="Focus Score"
              score={session.focusScore}
              type="focus"
              description="How efficiently this session converts time into earning potential."
              estimates={[
                { label: "Potential focus time lost", value: `${session.estimatedTimeLostMinutes} min` },
                { label: "Work mode", value: session.mode || "Client Project" },
                {
                  label: "Billable calibration",
                  value: `${session.billablePercentage ?? 70}%`,
                },
              ]}
            />
            <ScoreCard
              title="Hidden Cost Score"
              score={session.hiddenCostScore ?? session.carbonScore ?? 0}
              type="hidden-cost"
              description="How low your estimated lost earning, energy waste, and digital carbon impact are."
              estimates={[
                {
                  label: "Estimated hidden loss",
                  value: formatMoneyEstimate(session.estimatedRevenueLoss ?? 0, session.currency ?? "USD"),
                },
                {
                  label: "Digital waste level",
                  value: session.estimatedCarbonImpact?.level ?? "low",
                },
              ]}
            />
          </div>

          {/* Detailed agent insights */}
          <AgentInsights context={session.agents.contextAnalyzer} carbonCost={session.agents.carbonCostEstimator} />

          {/* Best action recommendation showcase */}
          <div className="bg-slate-900/20 border border-slate-800/80 p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="h-5 w-5 text-emerald-400" />
              <h2 className="font-bold text-slate-200">Recommended Sustainable Work Milestone</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-emerald-400">{session.bestAction.bestActionTitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Why:</strong> {session.bestAction.bestActionReason}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Expected Outcome:</strong> {session.bestAction.expectedOutcome}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Financial Impact:</strong> {session.bestAction.financialImpact}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Sustainability Impact:</strong> {session.bestAction.carbonImpact}
              </p>
            </div>
          </div>

          {/* Complete recommendations list */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-200">Action Plan Recommendations</h2>
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
              topicId={session.hedera.topicId}
              transactionId={session.hedera.transactionId}
              consensusTimestamp={session.hedera.consensusTimestamp}
              receiptStatus={session.hedera.receiptStatus}
              network={session.hedera.network}
              status={session.hedera.status}
              actionTitle={session.selectedAction?.title}
              estimatedFinancialBenefit={session.selectedAction?.financialBenefitLabel}
              hiddenCostScore={session.hiddenCostScore ?? session.carbonScore ?? 0}
            />
          )}

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setSession(null)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline font-medium transition-colors"
            >
              Analyze another work session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
