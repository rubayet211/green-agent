"use client";

import { CheckCircle2, Info, Link as LinkIcon } from "lucide-react";

interface HederaConfirmationProps {
  topicId?: string;
  transactionId?: string;
  consensusTimestamp?: string;
  receiptStatus?: string;
  network?: "testnet" | "previewnet" | "mainnet";
  status: "success" | "simulated" | "failed" | "pending";
  actionTitle?: string;
  estimatedFinancialBenefit?: string;
  hiddenCostScore?: number;
}

export default function HederaConfirmation({
  topicId,
  transactionId,
  consensusTimestamp,
  receiptStatus,
  network = "testnet",
  status,
  actionTitle,
  estimatedFinancialBenefit,
  hiddenCostScore,
}: HederaConfirmationProps) {
  const isSimulated = status === "simulated";
  const dateFormatted = consensusTimestamp
    ? new Date(consensusTimestamp).toLocaleString()
    : "Not submitted";

  return (
    <section
      aria-live="polite"
      className={`w-full p-6 rounded-xl shadow-xl mt-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${
        isSimulated
          ? "bg-sky-950/20 border border-sky-500/30"
          : "bg-emerald-950/20 border border-emerald-500/30"
      }`}
    >
      <div className="flex items-start gap-4">
        {isSimulated ? (
          <Info className="h-6 w-6 text-sky-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-4 w-full min-w-0">
          <div>
            <h2 className="font-bold text-slate-100">
              {isSimulated ? "Sustainable Work Milestone Simulated" : "Sustainable Work Milestone Logged"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isSimulated
                ? "Simulated milestone - no live Hedera transaction was created. Configure operator credentials and a topic ID for a public HCS record."
                : `Confirmed on Hedera ${network} with receipt status ${receiptStatus || "SUCCESS"}.`}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 rounded-lg border border-slate-900/60 bg-slate-950/40 p-4 text-xs md:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Action</dt>
              <dd className="text-slate-200 break-words">{actionTitle || "Sustainable work action"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Estimated benefit</dt>
              <dd className="text-emerald-300">{estimatedFinancialBenefit || "Directional estimate"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Hidden Cost Score</dt>
              <dd className="text-slate-200 font-mono">{hiddenCostScore ?? "Not recorded"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Topic ID</dt>
              <dd className="font-mono text-emerald-400 break-all">{topicId || "Not submitted"}</dd>
            </div>
            <div className="space-y-1 overflow-hidden">
              <dt className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Transaction ID</dt>
              <dd className="font-mono text-slate-300 break-all select-all">{transactionId || "Not submitted"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Consensus Time</dt>
              <dd className="text-slate-300 font-mono">{dateFormatted}</dd>
            </div>
          </dl>

          {!isSimulated && transactionId && (
            <a
              href={`https://hashscan.io/${network}/transaction/${transactionId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View on HashScan Explorer
              <LinkIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
