"use client";

import { CheckCircle2, Info, Link as LinkIcon } from "lucide-react";

interface HederaConfirmationProps {
  topicId?: string;
  transactionId?: string;
  consensusTimestamp?: string;
  receiptStatus?: string;
  network?: "testnet" | "previewnet" | "mainnet";
  status: "success" | "simulated" | "failed" | "pending";
}

export default function HederaConfirmation({
  topicId,
  transactionId,
  consensusTimestamp,
  receiptStatus,
  network = "testnet",
  status,
}: HederaConfirmationProps) {
  const isSimulated = status === "simulated";
  const dateFormatted = consensusTimestamp
    ? new Date(consensusTimestamp).toLocaleString()
    : "Not submitted";

  return (
    <section
      aria-live="polite"
      className={`w-full p-6 rounded-2xl shadow-xl mt-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${
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
              {isSimulated ? "Green Action Simulation Complete" : "Green Action Recorded on Hedera"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isSimulated
                ? "No Hedera transaction was submitted. Configure operator credentials and a topic ID to create a public ledger proof."
                : `Confirmed on Hedera ${network} with receipt status ${receiptStatus || "SUCCESS"}.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Topic ID</span>
              <span className="font-mono text-emerald-400 break-all">{topicId || "Not submitted"}</span>
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Transaction ID</span>
              <span className="font-mono text-slate-300 break-all select-all">{transactionId || "Not submitted"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Consensus Time</span>
              <span className="text-slate-300 font-mono">{dateFormatted}</span>
            </div>
          </div>

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
