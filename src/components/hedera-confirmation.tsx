"use client";

import { CheckCircle2, Link as LinkIcon, Info } from "lucide-react";

interface HederaConfirmationProps {
  topicId: string;
  transactionId: string;
  consensusTimestamp: string;
  status: "success" | "simulated" | string;
}

export default function HederaConfirmation({
  topicId,
  transactionId,
  consensusTimestamp,
  status
}: HederaConfirmationProps) {
  const isSimulated = status === "simulated";
  const dateFormatted = new Date(consensusTimestamp).toLocaleString();

  return (
    <div className="w-full bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-2xl shadow-xl mt-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Background neon glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start gap-4">
        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-4 w-full">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              Green Action Logged Successfully
              {isSimulated && (
                <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Simulated Sandbox
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your selected action has been recorded permanently on the Hedera testnet network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Topic ID</span>
              <span className="font-mono text-emerald-400">{topicId}</span>
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Transaction ID</span>
              <span className="font-mono text-slate-300 break-all select-all">{transactionId}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Consensus Time</span>
              <span className="text-slate-300 font-mono">{dateFormatted}</span>
            </div>
          </div>

          {isSimulated ? (
            <div className="flex items-center gap-2 text-[10px] text-sky-400/80 bg-sky-950/20 border border-sky-800/30 p-3 rounded-lg">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                Running in Demo Fallback Mode. Logged to simulated consensus storage because Hedera operator keys are not configured in `.env.local`.
              </span>
            </div>
          ) : (
            <a
              href={`https://hashscan.io/testnet/transaction/${transactionId}`}
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
    </div>
  );
}
