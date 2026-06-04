# GreenAgent MVP

**Tagline:** "Get more focused work done while reducing your digital carbon footprint."

GreenAgent is a multi-agent AI productivity co-pilot developed for the **Beyond Tomorrow Summit 2026 Hackathon**. It analyzes your digital work behaviors, computes a Productivity Focus Score and Digital Carbon Score, suggests actions, and records green choices transparently on the Hedera testnet.

---

## 💡 Core Innovation & Concept
1. **Habit Assessment:** Evaluates focus metrics (open tabs density, screen hours, active agenda text) to reveal productivity bottlenecks.
2. **Digital Carbon Footprint Calculation:** Simulates computational energy waste estimates (background tab sync queries, sustained display power levels) to increase digital waste awareness.
3. **Multi-Agent Reasoning:** Coordinates sequential, structured agent queries in Next.js backend services:
   - **Context Analyzer Agent:** Contextualizes workflow habits.
   - **Carbon Estimator Agent:** Estimates carbon footprint values.
   - **Optimizer Agent:** Balances scores and suggests optimization plans.
   - **Action Recommender Agent:** Spotlights primary carbon offset actions.
4. **Blockchain Integrity Logging:** Selects and commits green actions directly on-chain using **Hedera Consensus Service (HCS)**.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 16 (App Router, strict TypeScript)
- **Styles:** Tailwind CSS with dynamic custom dark glassmorphic themes
- **UI Library:** shadcn/ui and Lucide Icons
- **AI SDK:** `@google/genai` (standard model `gemini-2.5-flash`)
- **Database:** Firebase Firestore (Admin SDK server operations)
- **Distributed Ledger:** `@hashgraph/sdk` (Hedera HCS Testnet)
- **Schema Validation:** Zod

---

## 🚀 Seamless Fallback Mode (Runs Out of the Box!)
To support instant evaluation without initial api configuration:
- **Firestore Fallback:** Reads and writes are directed automatically to a local file store at `data/local_sessions.json` if Firebase key values are omitted.
- **Gemini Fallback:** Local scoring heuristics execute, providing identical mock JSON session properties so analysis completes.
- **Hedera Fallback:** Action submissions create simulated transaction receipts and topic IDs prefixed with `0.0.9999-mock`.

---

## ⚙️ Environment Variables Config (.env.local)
Copy `.env.local.example` into `.env.local` and populate:
```env
GEMINI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
HEDERA_TOPIC_ID=
```
*Note:* If pasting multi-line Firebase private keys directly into standard shell configurations, ensure newline characters `\n` are replaced with normal strings properly.

---

## 📋 Step-by-Step Developer Setup

### 1. Installation
Install all required workspace modules:
```bash
npm install
```

### 2. Set Up Hedera Consensus Topic (Optional)
If you have configured `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`, you can automatically provision a new HCS topic using our build helper:
```bash
npm run create-topic
```
Copy the output `Topic ID` and add it to `HEDERA_TOPIC_ID` in `.env.local`.

### 3. Running Locally
Execute the local Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test the dashboard.

### 4. Compiling the Production Build
Test strict build verification:
```bash
npm run build
```

---

## ⚡ Hackathon Demo Script
1. Open the homepage dashboard console.
2. Input **115 tabs**, **12 screen hours**, and tasks as: *"Researching Hedera consensus tools, chatting with development groups on Slack, keeping 10 server threads running."* Choose mode as *"Research"*.
3. Click **Analyze with GreenAgent**.
4. Review the progressive loading states as the context analysis runs.
5. Check out the calculated scores: Focus Score (Low due to heavy multi-tasking) and Carbon Score (High carbon footprint risk).
6. Read the detailed insights drafted by the Context Analyzer and Carbon Estimator.
7. Browse the Action Plan. Select the **"Consolidate unused tabs"** action card.
8. Click **Log as Green Action on Hedera**.
9. Observe transaction timestamp receipts and explorer log values update dynamically.
10. Visit `/history` to review sessions.
