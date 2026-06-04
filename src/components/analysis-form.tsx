"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, AlertTriangle } from "lucide-react";

interface AnalysisFormProps {
  onSubmit: (data: { tabs: number; hours: number; tasks: string; mode: string }) => void;
  isLoading: boolean;
}

const templates = [
  {
    name: "Deep Work Day",
    tabs: 8,
    hours: "5",
    tasks: "Finish the highest-priority project milestone without checking messages.",
    mode: "Deep Work",
  },
  {
    name: "Research Mode",
    tabs: 35,
    hours: "7",
    tasks: "Review sources, compare findings, and write a concise research summary.",
    mode: "Research",
  },
  {
    name: "Study Session",
    tabs: 12,
    hours: "4",
    tasks: "Complete the study plan, take notes, and review difficult concepts.",
    mode: "Study",
  },
  {
    name: "Creative Work",
    tabs: 15,
    hours: "6",
    tasks: "Draft concepts, refine the strongest direction, and prepare a review.",
    mode: "Creative Work",
  },
];

export default function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [tabs, setTabs] = useState<number>(15);
  const [hours, setHours] = useState<string>("6");
  const [tasks, setTasks] = useState<string>("");
  const [mode, setMode] = useState<string>("Deep Work");
  const [error, setError] = useState<string>("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numericHours = parseFloat(hours);

    if (isNaN(numericHours) || numericHours < 0 || numericHours > 24) {
      setError("Hours must be a number between 0 and 24");
      return;
    }
    if (!tasks.trim()) {
      setError("Tasks list cannot be empty");
      return;
    }
    if (tabs < 0 || tabs > 300) {
      setError("Tabs count must be between 0 and 300");
      return;
    }

    onSubmit({
      tabs,
      hours: numericHours,
      tasks: tasks.trim(),
      mode
    });
  };

  return (
    <Card className="w-full bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          Habit Analysis Console
        </CardTitle>
        <CardDescription className="text-slate-400">
          Tell GreenAgent your current work metrics to receive an optimization plan.
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
            <legend className="text-sm font-medium text-slate-300">Quick templates</legend>
            <div className="flex flex-wrap gap-2">
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
                  className="border-slate-700 bg-slate-950/40 text-slate-300 hover:bg-slate-800"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tab Slider */}
            <div className="space-y-2">
              <label htmlFor="open-tabs" className="text-sm font-medium text-slate-300 flex justify-between">
                <span>Open Browser Tabs</span>
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
                <span>0 Tabs</span>
                <span>150 Tabs</span>
                <span>300 Tabs</span>
              </div>
            </div>

            {/* Hours Screen time */}
            <div className="space-y-2">
              <label htmlFor="screen-hours" className="text-sm font-medium text-slate-300">
                Screen Hours Today
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Work Mode */}
            <div className="space-y-2">
              <label htmlFor="work-mode" className="text-sm font-medium text-slate-300">
                Current Work Mode
              </label>
              <Select value={mode} onValueChange={(val) => setMode(val || "Deep Work")}>
                <SelectTrigger id="work-mode" className="bg-slate-950/60 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                  <SelectItem value="Deep Work">Deep Work</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Meetings">Meetings</SelectItem>
                  <SelectItem value="Creative Work">Creative Work</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tasks Textarea */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="key-tasks" className="text-sm font-medium text-slate-300">
                Key Tasks / Agenda for Today
              </label>
              <Textarea
                id="key-tasks"
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                maxLength={1_000}
                rows={3}
                className="bg-slate-950/60 border-slate-800 text-slate-200 focus:border-emerald-500/50"
                placeholder="e.g., Coding core features, checking mirrors docs, replying to email logs..."
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold transition-all h-11"
          >
            {isLoading ? "Running Digital Analysis..." : "Analyze with GreenAgent"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
