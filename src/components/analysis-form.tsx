"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefcaseBusiness, AlertTriangle } from "lucide-react";
import type { Currency, WorkMode } from "@/types/greenagent";

interface AnalysisInput {
  tabs: number;
  hours: number;
  tasks: string;
  mode: WorkMode;
  hourlyRate?: number;
  billablePercentage?: number;
  currency: Currency;
}

interface AnalysisFormProps {
  onSubmit: (data: AnalysisInput) => void;
  isLoading: boolean;
}

const modes: WorkMode[] = [
  "Client Project",
  "Proposal Writing",
  "Research",
  "Content Creation",
  "Deep Work",
  "Admin / Communication",
];

const currencies: Currency[] = ["USD", "BDT", "INR", "EUR", "GBP"];

const templates: Array<{
  name: string;
  tabs: number;
  hours: string;
  tasks: string;
  mode: WorkMode;
}> = [
  {
    name: "Client Project",
    tabs: 18,
    hours: "6",
    tasks: "Ship the highest-value client deliverable and prepare a concise update.",
    mode: "Client Project",
  },
  {
    name: "Proposal Writing",
    tabs: 12,
    hours: "4",
    tasks: "Write one tailored proposal, gather proof points, and send it before the deadline.",
    mode: "Proposal Writing",
  },
  {
    name: "Research",
    tabs: 38,
    hours: "7",
    tasks: "Compare sources, extract the useful findings, and turn them into client-ready notes.",
    mode: "Research",
  },
  {
    name: "Content Creation",
    tabs: 22,
    hours: "5",
    tasks: "Draft, edit, and package one publishable content asset for review.",
    mode: "Content Creation",
  },
  {
    name: "Deep Work",
    tabs: 8,
    hours: "5",
    tasks: "Complete one focused milestone without checking messages or unrelated references.",
    mode: "Deep Work",
  },
  {
    name: "Admin / Communication",
    tabs: 16,
    hours: "3",
    tasks: "Batch invoices, client replies, status updates, and scheduling into one admin block.",
    mode: "Admin / Communication",
  },
];

export default function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [tabs, setTabs] = useState<number>(18);
  const [hours, setHours] = useState<string>("6");
  const [tasks, setTasks] = useState<string>("");
  const [mode, setMode] = useState<WorkMode>("Client Project");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [billablePercentage, setBillablePercentage] = useState<string>("70");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [error, setError] = useState<string>("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numericHours = parseFloat(hours);
    const numericHourlyRate = hourlyRate.trim() ? Number(hourlyRate) : undefined;
    const numericBillablePercentage = billablePercentage.trim()
      ? Number(billablePercentage)
      : undefined;

    if (Number.isNaN(numericHours) || numericHours < 0 || numericHours > 24) {
      setError("Screen hours must be a number between 0 and 24.");
      return;
    }
    if (!tasks.trim()) {
      setError("Main work tasks cannot be empty.");
      return;
    }
    if (tabs < 0 || tabs > 300) {
      setError("Open tabs must be between 0 and 300.");
      return;
    }
    if (
      numericHourlyRate !== undefined &&
      (Number.isNaN(numericHourlyRate) || numericHourlyRate < 0 || numericHourlyRate > 1000)
    ) {
      setError("Hourly rate must be between 0 and 1000.");
      return;
    }
    if (
      numericBillablePercentage !== undefined &&
      (Number.isNaN(numericBillablePercentage) ||
        numericBillablePercentage < 0 ||
        numericBillablePercentage > 100)
    ) {
      setError("Billable percentage must be between 0 and 100.");
      return;
    }

    onSubmit({
      tabs,
      hours: numericHours,
      tasks: tasks.trim(),
      mode,
      hourlyRate: numericHourlyRate,
      billablePercentage: numericBillablePercentage,
      currency,
    });
  };

  return (
    <Card className="w-full bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-emerald-400" />
          Freelancer Work Session
        </CardTitle>
        <CardDescription className="text-slate-400">
          Estimate focus leakage, hidden digital cost, and earning opportunity for your current work block.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-300">Quick presets</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTabs(template.tabs);
                    setHours(template.hours);
                    setTasks(template.tasks);
                    setMode(template.mode);
                  }}
                  className="justify-start border-slate-700 bg-slate-950/40 text-slate-300 hover:bg-slate-800"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="open-tabs" className="text-sm font-medium text-slate-300 flex justify-between">
                <span>Number of open tabs</span>
                <span className="text-emerald-400 font-bold">{tabs}</span>
              </label>
              <input
                id="open-tabs"
                type="range"
                min="0"
                max="300"
                value={tabs}
                onChange={(e) => setTabs(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0</span>
                <span>150</span>
                <span>300</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="screen-hours" className="text-sm font-medium text-slate-300">
                Screen hours today
              </label>
              <Input
                id="screen-hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-emerald-500/50"
                placeholder="e.g. 7.5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-2 md:col-span-1">
              <label htmlFor="work-mode" className="text-sm font-medium text-slate-300">
                Work mode / session type
              </label>
              <Select value={mode} onValueChange={(val) => setMode((val as WorkMode) || "Client Project")}>
                <SelectTrigger id="work-mode" className="bg-slate-950/60 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  {modes.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="hourly-rate" className="text-sm font-medium text-slate-300">
                Hourly rate estimate
              </label>
              <Input
                id="hourly-rate"
                type="number"
                step="0.01"
                min="0"
                max="1000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-emerald-500/50"
                placeholder="Optional; default uses 15"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="billable-percentage" className="text-sm font-medium text-slate-300">
                Billable percentage
              </label>
              <Input
                id="billable-percentage"
                type="number"
                step="1"
                min="0"
                max="100"
                value={billablePercentage}
                onChange={(e) => setBillablePercentage(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-emerald-500/50"
                placeholder="70"
              />
              <p className="text-[11px] text-slate-500">
                Used to avoid treating all screen time as billable.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium text-slate-300">
                Currency
              </label>
              <Select value={currency} onValueChange={(val) => setCurrency((val as Currency) || "USD")}>
                <SelectTrigger id="currency" className="bg-slate-950/60 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  {currencies.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="key-tasks" className="text-sm font-medium text-slate-300">
              Main work tasks today
            </label>
            <Textarea
              id="key-tasks"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              maxLength={1_000}
              rows={4}
              className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-emerald-500/50"
              placeholder="e.g., Build the client dashboard, answer scoped feedback, and send a progress note..."
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-all h-11"
          >
            {isLoading ? "Estimating Hidden Cost..." : "Analyze My Work Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
