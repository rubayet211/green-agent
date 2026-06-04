import { NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/validations/greenagent";
import { callAgent } from "@/lib/ai/gemini";
import { CONTEXT_ANALYZER_PROMPT, CARBON_ESTIMATOR_PROMPT, OPTIMIZER_PROMPT, ACTION_RECOMMENDER_PROMPT } from "@/lib/ai/prompts";
import { calculateFallbackScores } from "@/lib/utils/score";
import { sessionStore } from "@/lib/firebase/sessions";
import { GreenAgentSession, Recommendation, ContextAnalyzerOutput, CarbonEstimatorOutput, OptimizerOutput, ActionRecommenderOutput } from "@/types/greenagent";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request schema
    const parsedInput = AnalyzeRequestSchema.parse(body);
    const { tabs, hours, tasks, mode, anonymousUserId } = parsedInput;

    let contextAnalyzer: ContextAnalyzerOutput;
    let carbonEstimator: CarbonEstimatorOutput;
    let optimizer: OptimizerOutput;
    let actionRecommender: ActionRecommenderOutput;
    let focusScore: number = 0;
    let carbonScore: number = 0;
    let recommendations: Recommendation[] = [];
    let bestAction: ActionRecommenderOutput;
    let isMocked = false;

    const hasApiKey = !!process.env.GEMINI_API_KEY;

    if (hasApiKey) {
      try {
        // 1. Context Analyzer Agent
        const contextPrompt = CONTEXT_ANALYZER_PROMPT
          .replace("{{tabs}}", String(tabs))
          .replace("{{hours}}", String(hours))
          .replace("{{tasks}}", tasks)
          .replace("{{mode}}", mode || "Standard");
        contextAnalyzer = await callAgent(contextPrompt);

        // 2. Carbon Estimator Agent
        const carbonPrompt = CARBON_ESTIMATOR_PROMPT
          .replace("{{tabs}}", String(tabs))
          .replace("{{hours}}", String(hours))
          .replace("{{tasks}}", tasks)
          .replace("{{contextOutput}}", JSON.stringify(contextAnalyzer));
        carbonEstimator = await callAgent(carbonPrompt);

        // 3. Optimizer Agent
        const optimizerPrompt = OPTIMIZER_PROMPT
          .replace("{{tabs}}", String(tabs))
          .replace("{{hours}}", String(hours))
          .replace("{{tasks}}", tasks)
          .replace("{{contextOutput}}", JSON.stringify(contextAnalyzer))
          .replace("{{carbonOutput}}", JSON.stringify(carbonEstimator));
        optimizer = await callAgent(optimizerPrompt);

        focusScore = typeof optimizer.focusScore === "number" ? optimizer.focusScore : 70;
        carbonScore = typeof optimizer.carbonScore === "number" ? optimizer.carbonScore : 70;
        
        // Add random IDs to recommendations
        recommendations = (optimizer.recommendations || []).map((rec: Omit<Recommendation, "id">, idx: number) => ({
          ...rec,
          id: `rec-${idx}-${crypto.randomBytes(4).toString("hex")}`
        }));

        // 4. Action Recommender Agent
        const recommenderPrompt = ACTION_RECOMMENDER_PROMPT
          .replace("{{tabs}}", String(tabs))
          .replace("{{hours}}", String(hours))
          .replace("{{tasks}}", tasks)
          .replace("{{recommendations}}", JSON.stringify(recommendations));
        actionRecommender = await callAgent(recommenderPrompt);
        bestAction = actionRecommender;

      } catch (apiError) {
        console.error("Gemini routing chain error, executing fallback scores:", apiError);
        isMocked = true;
      }
    } else {
      isMocked = true;
    }

    if (isMocked) {
      // Heuristic fallback scoring
      const fallbacks = calculateFallbackScores({ tabs, hours, tasks });
      focusScore = fallbacks.focusScore;
      carbonScore = fallbacks.carbonScore;

      contextAnalyzer = {
        summary: `Analyze digital context for work load with ${tabs} tabs and ${hours} screen hours.`,
        focusRisks: tabs > 25 ? ["High multitasking behavior", "Context-switching penalties"] : ["Standard load"],
        workPattern: tabs > 30 ? "Heavy multi-tab explorer" : "Focused workstation",
        severity: tabs > 30 || hours > 8 ? "medium" : "low"
      };

      carbonEstimator = {
        estimatedImpact: hours > 8 ? "high" : "medium",
        carbonExplanation: `With screen time at ${hours} hours and ${tabs} tabs, background power and cloud queries run constantly.`,
        mainCarbonDrivers: ["Background tab syncing", "Sustained monitor energy usage"],
        sustainabilityRisk: hours > 10 ? "high" : "medium"
      };

      recommendations = [
        {
          id: `rec-0-${crypto.randomBytes(4).toString("hex")}`,
          title: "Consolidate unused tabs",
          description: "Keep only 5 core tabs open. Save the rest in a bookmark folder.",
          productivityBenefit: "Decreases brain clutter and contextual load.",
          sustainabilityBenefit: "Saves memory power load and reduces periodic network traffic.",
          difficulty: "easy",
          impact: "medium"
        },
        {
          id: `rec-1-${crypto.randomBytes(4).toString("hex")}`,
          title: "Implement a digital blackout hour",
          description: "Turn off screen for 60 minutes. Conduct outline planning on paper.",
          productivityBenefit: "Supports direct focus away from messaging channels.",
          sustainabilityBenefit: "Saves grid energy entirely for that block.",
          difficulty: "medium",
          impact: "high"
        },
        {
          id: `rec-2-${crypto.randomBytes(4).toString("hex")}`,
          title: "Opt-out of auto-sync databases",
          description: "Configure development servers to only sync on manual refresh.",
          productivityBenefit: "Prevents automatic rebuild distractions.",
          sustainabilityBenefit: "Cuts down constant background server API calculations.",
          difficulty: "hard",
          impact: "high"
        }
      ];

      bestAction = {
        bestActionTitle: "Consolidate unused tabs",
        bestActionReason: "Provides immediate cognitive focus improvement and scales down network tasks easily.",
        expectedOutcome: "Immediate reduction in background cloud queries."
      };
    }

    const sessionId = crypto.randomUUID();
    const session: GreenAgentSession = {
      id: sessionId,
      anonymousUserId,
      timestamp: new Date().toISOString(),
      tabs,
      hours,
      tasks,
      mode,
      focusScore,
      carbonScore,
      agents: {
        contextAnalyzer,
        carbonEstimator,
        optimizer: { focusScore, carbonScore, recommendations },
        actionRecommender: bestAction
      },
      recommendations,
      bestAction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save session to Firestore (or local JSON fallback)
    await sessionStore.saveSession(session);
    return NextResponse.json(session);

  } catch (e) {
    console.error("Analysis controller crashed:", e);
    const errMsg = e instanceof Error ? e.message : "Failed to analyze habits";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
