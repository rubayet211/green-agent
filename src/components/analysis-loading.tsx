"use client";

import { useEffect, useState } from "react";
import { Cpu, Leaf, Zap, BarChart } from "lucide-react";

const steps = [
  { text: "Context Analyzer is checking focus risks...", icon: Cpu },
  { text: "Carbon & Cost Estimator is estimating hidden digital costs...", icon: Leaf },
  { text: "Optimizer Agent is finding earning recovery opportunities...", icon: Zap },
  { text: "Action Recommender is selecting your Sustainable Work Milestone...", icon: BarChart }
];

export default function AnalysisLoading() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl flex flex-col items-center justify-center space-y-8 my-8 shadow-2xl relative overflow-hidden">
      {/* Neon glowing ambient gradients */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center">
          {(() => {
            const Icon = steps[currentStep].icon;
            return <Icon className="h-7 w-7 text-emerald-400 animate-pulse" />;
          })()}
        </div>
      </div>

      <div className="space-y-4 w-full text-center">
        <h3 className="text-lg font-semibold text-emerald-400">GreenAgent is estimating focus loss, hidden cost, and sustainable work opportunities...</h3>
        <div className="space-y-3 max-w-sm mx-auto text-left">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isPast = idx < currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  isActive ? "opacity-100 text-slate-200" : isPast ? "opacity-50 text-emerald-500" : "opacity-20 text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{step.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
