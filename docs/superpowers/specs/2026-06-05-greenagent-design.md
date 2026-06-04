# GreenAgent Design Specification

**Project Name:** GreenAgent  
**Tagline:** "Get more focused work done while reducing your digital carbon footprint."  
**Date:** 2026-06-05  

---

## 1. Overview
GreenAgent is a multi-agent AI productivity co-pilot designed to analyze a user's digital habits, provide recommendations optimized for both productivity and environmental sustainability, and log green actions securely on the Hedera testnet using Hedera Consensus Service (HCS). 

To ensure the project is highly accessible, it will automatically fall back to local mock databases and simulated HCS logging when API keys or credentials are missing from the configuration.

---

## 2. Core Architecture & Data Flows

```
+-----------------------------------------------------------------+
|                       Frontend (Next.js 15)                     |
|  - Home Route (/) with Glassmorphic Input Form & Results         |
|  - History Route (/history) displaying past sessions            |
|  - Session Route (/session/[id]) for detail viewing             |
+-------------------------------+---------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                       API Routing Layer                         |
|  - POST /api/analyze                                            |
|  - POST /api/hedera/log-action                                  |
|  - GET  /api/history                                            |
|  - GET  /api/session/[id]                                       |
+-------------------------------+---------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                     Server Logic & SDKs                         |
|                                                                 |
|  [AI Orchestration]                                             |
|  - Context Analyzer  -> Carbon Estimator                        |
|  - Optimizer Agent   -> Action Recommender                      |
|                                                                 |
|  [Storage Engine]                                               |
|  - Firestore OR Local JSON File Store (Fallback)                |
|                                                                 |
|  [Hedera Ledger]                                                |
|  - Real Hedera Consensus Service OR Simulated Logger (Fallback) |
+-----------------------------------------------------------------+
```

---

## 3. Data Models

We will represent the session data in the following structures:

```typescript
export interface ContextAnalyzerOutput {
  summary: string;
  focusRisks: string[];
  workPattern: string;
  severity: "low" | "medium" | "high";
}

export interface CarbonEstimatorOutput {
  estimatedImpact: "low" | "medium" | "high";
  carbonExplanation: string;
  mainCarbonDrivers: string[];
  sustainabilityRisk: "low" | "medium" | "high";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  productivityBenefit: string;
  sustainabilityBenefit: string;
  difficulty: "easy" | "medium" | "hard";
  impact: "low" | "medium" | "high";
}

export interface OptimizerOutput {
  focusScore: number;
  carbonScore: number;
  recommendations: Recommendation[];
}

export interface ActionRecommenderOutput {
  bestActionTitle: string;
  bestActionReason: string;
  expectedOutcome: string;
}

export interface GreenAgentSession {
  id: string;
  anonymousUserId: string;
  timestamp: string;
  tabs: number;
  hours: number;
  tasks: string;
  mode?: string;
  focusScore: number;
  carbonScore: number;
  agents: {
    contextAnalyzer: ContextAnalyzerOutput;
    carbonEstimator: CarbonEstimatorOutput;
    optimizer: OptimizerOutput;
    actionRecommender: ActionRecommenderOutput;
  };
  recommendations: Recommendation[];
  bestAction: ActionRecommenderOutput;
  selectedAction?: Recommendation;
  hedera?: {
    topicId?: string;
    transactionId?: string;
    consensusTimestamp?: string;
    status: "pending" | "success" | "failed" | "simulated";
    message?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Multi-Agent Chain

The `/api/analyze` endpoint simulates a multi-agent system using sequential structured calls to Gemini (via `@google/genai`):

1. **Context Analyzer Agent:**
   - **Role:** Analyzes user input (tabs, hours, tasks, mode) to synthesize a work state.
   - **Prompt:** Focuses on extracting patterns and key severity risks.
2. **Carbon Estimator Agent:**
   - **Role:** Estimates digital carbon footprint from behavioral habits.
   - **Prompt:** Focuses on environmental impact, drivers, and risks based on context output.
3. **Optimizer Agent:**
   - **Role:** Balances focus versus sustainability.
   - **Prompt:** Generates Focus and Carbon scores, and designs 3-4 specific recommendations.
4. **Action Recommender Agent:**
   - **Role:** Selects the single highest-impact action.
   - **Prompt:** Recommends the best immediate recommendation to log on-chain.

**Fallback Guardrail:**  
If a Gemini model call fails or returns malformed JSON, a deterministic fallback calculation is executed using local logic (`src/lib/utils/score.ts`) to prevent frontend crashes.

---

## 5. Storage Engine (Firestore vs Local JSON Fallback)

To make running the project seamless, the storage engine detects credentials dynamically:
- **With Firebase configuration:** Connects using `firebase-admin` (server-side) or the Client SDK (if client writes are direct) to save sessions in `/sessions`.
- **Without Firebase configuration:** Read/writes sessions from a local file at `data/local_sessions.json`.
- This ensures full CRUD operations for session analysis and history pages function without environment keys.

---

## 6. Hedera Consensus Service Logging

When a user selects an action:
1. **With Hedera keys:** Connects to Hedera Testnet via `@hashgraph/sdk`, submits a JSON payload to the `HEDERA_TOPIC_ID`, and receives transaction consensus.
2. **Without Hedera keys:** Logs the action, stamps status as `"simulated"`, and returns a mock transaction ID (prefixed with `0.0.9999-mock`).

A developer script at `scripts/create-hedera-topic.ts` provides simple one-time topic initialization on Hedera testnet.

---

## 7. UX/UI & Glassmorphic Styling

- **Theme:** Premium, dark-mode first UI centered around deep dark grey backgrounds, translucent panels, emerald green gradients, and sky blue accents.
- **Micro-Interactions:** Custom dynamic progress spinners and progress bars.
- **Interactive State Loader:** Step-by-step indicator showcasing each of the 4 agents loading sequentially as the backend processes the request.
