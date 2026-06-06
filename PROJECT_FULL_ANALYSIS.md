# GreenAgent Codebase Analysis & Architecture Documentation

This document serves as the definitive codebase knowledge base and reverse-engineering guide for the **GreenAgent** project. It is structured to provide both human engineers and language models with a complete, deep-dive understanding of the project's purpose, design, logic, and operational realities.

---

## 1. Project Overview

**GreenAgent** is a freelancer-focused productivity and digital sustainability copilot designed and developed for the **Beyond Tomorrow Summit 2026 Hackathon**. The core value proposition is mapping hidden productivity leakage (excessive browser tab clutter, screen time fatigue, lack of clear task planning) directly to lost earning potential (estimated revenue loss) and digital carbon footprint costs.

The application leverages a sequential four-stage AI orchestration pipeline powered by Google Gemini (using the stable `gemini-2.5-flash` model) to evaluate the user's workspace parameters:
1. **Tabs Count** (browser tab density, indicating context switching and system memory load).
2. **Screen Hours** (daily screen time, representing energy consumption and user fatigue).
3. **Main Tasks** (clarity and structure of the work objectives).
4. **Work Mode** (active style, e.g., client projects, admin, writing, etc.).
5. **Earning Calibration** (hourly rate, billable percentage, and currency).

From these inputs, GreenAgent generates:
- **Focus Score** (0-100 score indicating efficiency in converting screen time into earning potential).
- **Hidden Cost Score** (0-100 score representing digital waste minimization, energy cost, and carbon impact mitigation).
- **Earning/Focus Impact Metrics** (estimated revenue loss, estimated focus time lost, estimated electricity costs).
- **Customized Recommendations** (3-4 highly specific focus recovery and waste reduction tasks with estimated financial/time benefits).
- **Primary Sustainable Work Milestone** (an optimized priority task).

Users can select any recommendation and publish it as a publicly verifiable proof to the **Hedera Consensus Service (HCS)** as a `SUSTAINABLE_WORK_MILESTONE` message, creating a immutable log of sustainable work achievements.

---

## 2. Executive Summary

- **Upgraded MVP Completion Level:** **91%**
  - **Core Flow:** Fully implemented from habits intake to AI-driven estimates, local fallbacks, Firestore state synchronization, and Hedera blockchain logging.
  - **Security Architecture:** Server-side credentials are kept strictly isolated. Client sessions are bound using HMAC-SHA256 signed HttpOnly anonymous identity cookies.
  - **Resilience Strategy:** The AI orchestrator automatically shifts to a deterministic local calculation engine if Gemini times out or returns malformed payloads. Database operations shift to local JSON files in development and test environments if Firebase credentials are omitted (file-based persistence is blocked in production to protect serverless instances).
  - **Ledger Verification:** Features a dual-mode Hedera module. Confirmed topic messages receive transaction IDs linked to the HashScan explorer, while missing credentials trigger an honest simulation badge rather than fabricating fake hashes.
  - **Testing Quality:** 47 comprehensive unit and integration tests verify the orchestrator, local math, database adapter, cryptographic tokens, and rate limit bounds under Vitest.

---

## 3. Tech Stack Summary

The project is built on the following modern web stack:

| Layer | Technology | Details |
|---|---|---|
| **Core Framework** | Next.js 16.2.7 | Leverages the React 19 App Router paradigm for server endpoints and client view rendering. |
| **Language** | TypeScript 5.x | Strict type safety is enforced; type checking (`tsc --noEmit`) passes with zero warnings. |
| **Styling & Design** | Tailwind CSS v4 / PostCSS | Employs Tailwind v4 with OKLCH color spaces and responsive design presets. |
| **UI Components** | Radix / Base UI / shadcn | Component blocks built using `@base-ui/react` and configured in [components.json](file:///j:/Saas/green-agent/components.json). |
| **Icons** | Lucide React | Provides vector icons for metrics dashboard, history list, and controls. |
| **AI Integration** | `@google/genai` (v2.8.0) | Runs structured-output JSON queries against the stable `gemini-2.5-flash` model. |
| **Ledger / Web3** | `@hashgraph/sdk` (v2.80.0) | Interacts with the Hedera Hashgraph SDK to submit consensus messages to HCS topics. |
| **Database** | Firebase Admin SDK (v13.10.0) | Handles session saving and list querying on Google Cloud Firestore. |
| **Validation** | Zod (v4.4.3) | Parses and validates API parameters, AI payloads, and session schemas. |
| **Testing** | Vitest (v4.1.8) | Runs unit and integration suites (47 test cases passing). |

---

## 4. Dependency Analysis

### Runtime Dependencies (documented in [package.json](file:///j:/Saas/green-agent/package.json))
- **`next` / `react` / `react-dom`:** Web application framework core (Next 16.2.7, React 19.2.4).
- **`@google/genai`:** Google GenAI SDK used to query Gemini models with structured JSON schemas.
- **`@hashgraph/sdk`:** Web3 client libraries used for Hedera HCS transactions.
- **`firebase-admin`:** Server-side Firebase SDK. Excluded from client-side bundles.
- **`zod`:** Schema parsing library used to enforce request boundaries.
- **`@base-ui/react` / `class-variance-authority` / `clsx` / `tailwind-merge` / `tw-animate-css` / `shadcn`:** CSS and design layout utilities.
- **`lucide-react`:** SVG vector icons.

### Development Dependencies (documented in [package.json](file:///j:/Saas/green-agent/package.json))
- **`typescript`:** Language compiler.
- **`vitest`:** Test runner.
- **`dotenv`:** Local environment variables loader.
- **`ts-node`:** Execution environment for setup scripts.
- **`tailwindcss` / `@tailwindcss/postcss`:** CSS compilation utility.
- **`eslint` / `eslint-config-next`:** Standard syntax audits.

### Transitive Package Overrides
To resolve vulnerabilities and compilation mismatches within the Hedera SDK, [package.json](file:///j:/Saas/green-agent/package.json) overrides `protobufjs`:
```json
"overrides": {
  "@hashgraph/sdk": {
    "protobufjs": "7.6.2"
  },
  "@hashgraph/proto@2.26.0-beta.3": {
    "protobufjs": "7.6.2"
  }
}
```
*Purpose:* Force-pins `protobufjs` to a secure version `7.6.2` to eliminate transitive vulnerability warnings and typescript conflicts in compilation.

---

## 5. Architecture Overview

GreenAgent uses a full-stack Next.js architecture with isolated server-side modules to protect credentials and secrets:

```
                      +-------------------+
                      |      Browser      |
                      +---------+---------+
                                |
                    Secure Cookie| (greenagent_identity)
                                v
                      +---------+---------+
                      |  Next.js Server   |
                      +---------+---------+
                                |
         +----------------------+-----------------------+
         |                      |                       |
         v                      v                       v
 +-------+-------+      +-------+-------+       +-------+-------+
 |    lib/ai     |      | lib/firebase  |       |  lib/hedera   |
 | (Gemini Chain)|      |  (Firestore)  |       |  (HCS Logs)   |
 +-------+-------+      +---------------+       +---------------+
         |
         +-- (1) Context Analyzer
         +-- (2) Carbon & Cost Estimator
         +-- (3) Optimizer (Focus/Hidden Cost Scores)
         +-- (4) Action Recommender (Sustainable Milestone)
```

### Server-Side Isolation
To protect the `GEMINI_API_KEY`, Firebase service accounts, and Hedera private keys, all SDK initializations and API queries are confined to server libraries (`src/lib/*`). The frontend browser communicates with the server strictly via standard JSON endpoints (`/api/*`).

### HMAC-SHA256 Signed Anonymous Identity Flow
Rather than requiring full email registration, GreenAgent implements a cryptographically signed cookie session strategy:
1. The client queries `/api/identity`.
2. The server generates a unique UUID `anonymousUserId`, sets an expiration timestamp (1 year), and signs it using HMAC-SHA256 with the server-only `ANONYMOUS_SESSION_SECRET`.
3. The token is appended to the response via a `Set-Cookie` header as `greenagent_identity` with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) flags.
4. Subsequent requests automatically send the cookie, which the server parses and validates using constant-time comparison (`crypto.timingSafeEqual`) to block verification timing attacks.

---

## 6. Folder and File Structure Breakdown

The codebase is organized as follows:

```
green-agent/
├── .env.local.example           # Reference file for environment configuration variables
├── firebase.json                # Firebase configuration parameters
├── firestore.indexes.json       # Index requirements for Firestore collections
├── package.json                 # Project manifest and execution scripts
├── next.config.ts               # Next.js configurations, including custom Content Security Policies
├── vitest.config.ts             # Vitest test framework parameters
├── data/                        # Local file fallback directory (for development & test environments)
│   └── local_sessions.json
├── scripts/                     # Node execution scripts
│   └── create-hedera-topic.ts   # Helper script to create HCS Topic IDs on Hedera
└── src/
    ├── app/                     # Next.js App Router directories
    │   ├── api/                 # Route handlers (analyze, identity, history, hedera log-action)
    │   │   ├── analyze/
    │   │   ├── hedera/log-action/
    │   │   ├── history/
    │   │   ├── identity/
    │   │   └── session/[id]/
    │   ├── history/             # Session list logs page UI
    │   ├── session/[id]/        # Session details page UI
    │   ├── globals.css          # Styling configurations and root variables
    │   ├── layout.tsx           # Main global HTML wrapper
    │   └── page.tsx             # Copilot home console UI
    ├── components/              # Frontend React UI components
    │   ├── ui/                  # Reusable basic elements (buttons, inputs, progress bars)
    │   ├── agent-insights.tsx   # Detailed Context & Carbon agent summary columns
    │   ├── analysis-form.tsx    # Workspace parameters intake form and presets
    │   ├── analysis-loading.tsx # Loading sequence messages
    │   ├── app-shell.tsx        # Navigation, stick header, blur background decorations
    │   ├── hedera-confirmation.tsx # Real vs. simulated ledger record indicators
    │   ├── recommendation-card.tsx # Recommendation selections and logging controls
    │   ├── score-card.tsx       # Focus vs. Hidden Cost metrics progress circles/bars
    │   └── session-trend-summary.tsx # SVG polyline historical trends component
    ├── lib/                     # Server-side domain business logic libraries
    │   ├── ai/                  # Multi-agent pipelines, prompts, and Gemini SDK wrappers
    │   ├── firebase/            # Firestore persistence adapters
    │   ├── hedera/              # Hedera transactions and operator clients
    │   ├── http/                # Request validation and error payload formatting
    │   ├── security/            # Rate limiting and identity cookies logic
    │   ├── utils/               # Math, currency, trend formatting tools
    │   └── validations/         # Zod data schemas
    └── types/                   # Shared TypeScript interfaces
        └── greenagent.ts
```

---

## 7. Product Purpose and Problem Solved

### The Problem
Freelancers and remote digital workers operate in highly unstructured workspaces. They often suffer from **workspace fragmentation**:
- **Attention Leakage:** Having dozens of open browser tabs and running long, uninterrupted screen hours leads to constant context switching and fatigue, quietly destroying billable focus time.
- **Digital Waste:** Keeping background browser synchronization loops, heavy web applications, and idle tabs active increases CPU/GPU memory loads, drains device batteries, and raises indirect network and server-side energy consumption (digital carbon footprint).
- **Invisible Cost:** Traditional focus trackers only record time, while environmental trackers only record generic offsets. Neither links workspace behavior directly to a freelancer's real concern: **lost billable earning potential**.

### The Solution
**GreenAgent** solves this by connecting productivity metrics and sustainability impacts into a unified freelancer value statement. It quantifies attention leakage, calculates estimated financial loss, proposes actionable daily habits (e.g., closing non-client tabs, batching communication windows) with estimated financial returns, and logs achievements to a public ledger to provide clients or teams with verifiable proofs of focused, energy-efficient work habits.

---

## 8. User Roles and Primary Workflows

### User Roles
- **Anonymous Browser Session:** No password registration or OAuth credentials are required. Users are identified immediately via the signed HttpOnly browser cookie. This ensures personal dashboard and session history data is isolated to their profile.

### Primary User Workflows

```
[Presest/Form Input] ---> [Analyze with GreenAgent] ---> [Review Focus/Hidden Cost]
                                                                  |
                                                                  v
[Ledger Receipt] <--- [Log Action to Hedera] <--- [Select Customized Action]
```

1. **Workspace Intake:** User loads the console and inputs their active tabs, daily screen hours, main tasks, hourly rate, currency, and billable percentage. Users can use one-click templates (e.g., "Deep Work", "Research", "Proposal Writing") to prefill values.
2. **AI Analysis Request:** User submits the form. The system routes the payload to `/api/analyze`, triggering the Gemini multi-agent chain (or the local fallback engine).
3. **Metric Review:** User inspects their **Focus Score** (higher is better, indicating focus efficiency) and **Hidden Cost Score** (higher is better, indicating low digital waste), reads the narrative reports of the Context and Carbon agents, and reviews the recommended priority milestone.
4. **Action Commit:** User clicks an action card (e.g. "Close non-client tabs before next block"), which expands to show estimated time saved and financial benefits, and clicks "Log as Sustainable Work Milestone".
5. **Ledger Submission:** The server writes a structured JSON proof containing session metrics to the Hedera HCS topic. The browser renders a confirmed transaction receipt with direct links to the HashScan explorer (or a simulated badge if operator keys are omitted).
6. **Trends Monitoring:** User navigates to the "History" tab to review past sessions, tracking average focus scores, total opportunity logged, and progress lines.

---

## 9. Full Feature Inventory

- **Habit Metrics Intake Console (`src/components/analysis-form.tsx`):**
  - Interactive range slider for tabs (0-300).
  - Float field for screen hours (0-24).
  - Selective freelancer work presets ("Client Project", "Research", "Deep Work", "Proposal Writing", "Content Creation", "Admin / Communication").
  - Inputs for Hourly Rate, Billable Calibration percentage, and Currency (USD, BDT, INR, EUR, GBP).
  - Text area for main tasks (up to 1,000 characters).
- **AI Orchestrator Pipeline (`src/lib/ai/orchestrator.ts`):**
  - Sequentially chains four specialized Gemini prompts, feeding outputs forward to preserve context.
  - Enforces schema matching via Zod validators.
- **Deterministic Fallback Engine (`src/lib/ai/fallback.ts`):**
  - A math-based backup module. If Gemini is rate-limited or times out, it computes scores and recommendations locally, ensuring the UI remains active.
- **Anonymous Identity Manager (`src/lib/security/identity.ts`):**
  - Generates cryptographically signed cookies containing UUIDs to isolate user histories.
- **Dual Database Persistence (`src/lib/firebase/sessions.ts`):**
  - Saves session records to Cloud Firestore. Falls back to a local JSON file in development/test if credentials are missing. Blocks local fallback in production to protect server integrity.
- **Hedera consensus logging (`src/lib/hedera/client.ts`):**
  - Submits structured JSON payloads to HCS. Detects key signatures and handles simulation flows gracefully.
- **Historical SVG Trend Charts (`src/components/session-trend-summary.tsx`):**
  - Generates lightweight SVG polylines showing focus and hidden-cost improvements without heavy external chart libraries.

---

## 10. Pages / Routes / Screens Breakdown

### Client-Side Routes

#### 1. Habitation Console (`src/app/page.tsx`)
- **Path:** `/`
- **Auth:** None (implicitly initializes identity cookie).
- **Core Sections:** Header navbar, Hero banner, Intake form (hidden when analysis results load), Loading state indicator, Score cards, Agent insights columns, Recommended Priority Milestone box, Action recommendations list, Hedera receipt panel.
- **Key Actions:** Submit session metrics, toggle templates, select recommendation, invoke Hedera transaction logging, reset to log a new session.

#### 2. Work Session History (`src/app/history/page.tsx`)
- **Path:** `/history`
- **Auth:** Signed anonymous cookie required.
- **Core Sections:** Page headers, Average Focus and Hidden Cost dashboards, total estimated revenue loss, total logged opportunity, historical SVG line charts, session list cards.
- **Key Actions:** Fetch and display history, click session card to route to details page.

#### 3. Session Details Page (`src/app/session/[id]/page.tsx`)
- **Path:** `/session/[id]`
- **Auth:** Signed anonymous cookie required. Verifies ownership of the session ID before rendering; returns a 404 if the session belongs to another user.
- **Core Sections:** Back navigation link, timestamp headers, score progress bars, detailed agent columns, recommendation lists, Hedera receipt panel.
- **Key Actions:** Fetch and display single session records, retroactively log recommendations to Hedera if the session was initially left unlogged.

---

## 11. API / Backend Breakdown

### 1. Client Identity Initialization
- **Route:** `POST /api/identity`
- **Controller:** [route.ts](file:///j:/Saas/green-agent/src/app/api/identity/route.ts)
- **Inputs:** Client cookie request header.
- **Logic:** Checks for `greenagent_identity`. If missing or invalid, it creates a new signed token and appends it to the response via a `Set-Cookie` header.

### 2. Work Habits Analysis
- **Route:** `POST /api/analyze`
- **Controller:** [route.ts](file:///j:/Saas/green-agent/src/app/api/analyze/route.ts)
- **Validation Schema:** `AnalyzeRequestSchema` in [greenagent.ts](file:///j:/Saas/green-agent/src/lib/validations/greenagent.ts)
- **Logic:** Enforces active identity check and rate limit (5 requests per minute). Reads body, executes `runAnalysis` (querying Gemini or fallback), generates a session record, persists it to Firestore, and returns the session object.

### 3. Log Action to Hedera
- **Route:** `POST /api/hedera/log-action`
- **Controller:** [route.ts](file:///j:/Saas/green-agent/src/app/api/hedera/log-action/route.ts)
- **Validation Schema:** `HederaLogRequestSchema` in [greenagent.ts](file:///j:/Saas/green-agent/src/lib/validations/greenagent.ts)
- **Logic:** Requires active identity check and rate limit. Verifies that the session belongs to the requesting user. Submits the milestone payload to Hedera. Saves transaction IDs/timestamps, updates the session state in the database, and returns the updated session object.

### 4. Fetch Session History
- **Route:** `GET /api/history`
- **Controller:** [route.ts](file:///j:/Saas/green-agent/src/app/api/history/route.ts)
- **Logic:** Enforces identity check. Queries Firestore for records matching the user's ID, sorted in reverse-chronological order. Limits results to a maximum of 50.

### 5. Fetch Session Details
- **Route:** `GET /api/session/[id]`
- **Controller:** [route.ts](file:///j:/Saas/green-agent/src/app/api/session/[id]/route.ts)
- **Logic:** Enforces identity check. Retrieves the session from Firestore and verifies that the `anonymousUserId` matches the requester.

---

## 12. Database and Data Model Breakdown

### Database Storage Strategy (`src/lib/firebase/sessions.ts`)
The application uses a dual persistence adapter:
- **Google Cloud Firestore (Production):** The default persistence store. Sessions are saved in the `sessions` collection.
- **Local File System Fallback (Development/Testing):** In non-production environments, if Firestore credentials are missing, the system writes to `data/local_sessions.json` or `data/local_sessions.test.json`.
- **Production Safety Check:** Writing to the local file system is strictly forbidden in production. If Firestore credentials are missing on Vercel, the application throws a fatal initialization error to prevent data loss.

### Firestore Composite Indexes
To fetch session history using compound filters (filtering by user ID and sorting by timestamp), a composite index is declared in [firestore.indexes.json](file:///j:/Saas/green-agent/firestore.indexes.json):
- **Collection:** `sessions`
- **Fields:** `anonymousUserId` (Ascending) & `createdAt` (Descending)

### Session Data Schema (`src/lib/validations/greenagent.ts`)
The data model is defined by `GreenAgentSessionSchema` using Zod validation. It includes transformation logic to support backwards-compatibility for legacy sessions:
- **Legacy Property Translation:** Automatically maps legacy `carbonScore` values to the upgraded `hiddenCostScore` field.
- **Default Fields:** Populates missing currency values as `USD` and maps legacy carbon estimator structures to the upgraded cost estimator format.

| Field Name | Data Type | Validation Bounds / Enums | Description |
|---|---|---|---|
| **`id`** | string | UUID | Session identifier. |
| **`anonymousUserId`** | string | UUID | Owner user ID. |
| **`timestamp`** | string | ISO Date | Timestamp of analysis submission. |
| **`tabs`** | number | Integer: `0` to `300` | Browser tab count. |
| **`hours`** | number | Float: `0.0` to `24.0` | Active screen hours. |
| **`tasks`** | string | String: `1` to `1,000` chars | Main tasks list. |
| **`mode`** | string | "Client Project", "Research", "Deep Work", etc. | Active workspace mode. |
| **`hourlyRate`** | number | Float: `0` to `1,000` (Optional) | Hourly rate. |
| **`billablePercentage`** | number | Float: `0` to `100` (Optional) | Billable calibration percentage. |
| **`currency`** | string | USD, BDT, INR, EUR, GBP | Selected currency. |
| **`focusScore`** | number | Integer: `0` to `100` | Calculated Focus Score. |
| **`hiddenCostScore`** | number | Integer: `0` to `100` | Calculated Hidden Cost Score. |
| **`estimatedRevenueLoss`** | number | Float: non-negative | Estimated financial loss. |
| **`estimatedTimeLostMinutes`** | number | Integer: `0` to `1,440` | Estimated minutes lost to context switching. |
| **`estimatedElectricityCost`** | number | Float: non-negative | Estimated energy cost. |
| **`estimatedCarbonImpact`** | object | Level: "low"\|"medium"\|"high", explanation | Estimated environmental impact. |
| **`analysisSource`** | string | "gemini" \| "fallback" | Engine used for analysis. |
| **`recommendations`** | array | Max 4 items | Generated recommendation options. |
| **`bestAction`** | object | Validated sub-schema | Recommended priority milestone. |
| **`selectedAction`** | object | Recommendation (Optional) | The recommendation selected and logged to Hedera. |
| **`hedera`** | object | Transaction metadata (Optional) | Status, topic ID, transaction ID, network, consensus timestamp. |
| **`createdAt`** | string | ISO Date | Creation timestamp. |
| **`updatedAt`** | string | ISO Date | Last update timestamp. |

---

## 13. Authentication and Authorization

### Cookie Authentication
GreenAgent uses signed cookies to identify users:
- **Token Generation:** The UUID and expiration are serialized into a base64url payload, signed with HMAC-SHA256, and stored as `[payload].[signature]` in the `greenagent_identity` cookie.
- **Token Verification:** The signature is verified on the server using constant-time comparison `crypto.timingSafeEqual` to prevent timing attacks.

### Authorization Checks
All data access operations enforce ownership checks:
- **History Queries:** `/api/history` filters results by the caller's `anonymousUserId` only.
- **Session Detail Queries:** `/api/session/[id]` and `sessionStore.getOwnedSession` return `null` (causing a 404 error) if the session ID belongs to a different user ID.
- **Hedera Submissions:** `/api/hedera/log-action` checks session ownership before executing HCS transactions.

---

## 14. State Management and Data Flow

### Intake & Estimation Flow
1. The user selects a preset or inputs metrics on the home page and clicks submit.
2. The browser validates parameters, calls `/api/identity` if the identity cookie is missing, and sends a POST request to `/api/analyze`.
3. The server validates request bounds via `AnalyzeRequestSchema`, consumes a rate-limiting token, and triggers `runAnalysis`.
4. `runAnalysis` queries the sequential Gemini API chain. If a call fails, the system catches the error and runs `createFallbackAnalysis` using the local math calculations.
5. The session record is saved to the database (Firestore or local file fallback) and returned to the client.
6. The client updates state variables (`isLoading=false`, `session=data`) and renders the results dashboard.

### Milestone Logging Flow
1. The user selects a recommendation and clicks "Log as Sustainable Work Milestone".
2. The browser sends a POST request containing `sessionId` and `actionId` to `/api/hedera/log-action`.
3. The server retrieves the session and validates ownership.
4. The server builds the milestone payload and calls `submitToTopic`.
5. `submitToTopic` connects to Hedera (or falls back to simulated mode if operator keys are omitted) to submit the transaction.
6. The server updates the session's `selectedAction` and `hedera` metadata, saves the session, and returns it.
7. The client updates state variables, rendering the Hedera receipt and explorer link.

---

## 15. UI / Component System

- **Visual Theme & Glows:** Styled in a dark SaaS aesthetic with deep blue backgrounds (`#0A0E1A`) and radial blur gradients.
- **Responsive Layout:** Next.js pages are wrapped in `AppShell`, featuring sticky header bars and screen-reader labels. Brand and link labels hide automatically on screens smaller than 420px to prevent navigation breaks.
- **Form Controls:** Utilizes input sliders, dropdown selects, and text fields with client-side validation error displays.
- **Metric Cards:** Renders progress bars colored with sky-blue gradients (for Focus) and emerald-green gradients (for Hidden Cost), alongside key metric badges.
- **Recommendation Selection Cards:** Renders cards with keyboard-accessible HTML buttons (`aria-pressed`), displaying estimated time saved and financial benefits side-by-side.
- **Lightweight SVG Charts:** Renders historical trend lines as lightweight SVG polylines. Points are calculated dynamically based on score indices.

---

## 16. External Integrations

### 1. Google Gemini AI API
- **Client Wrapper:** `src/lib/ai/gemini.ts`
- **Model Target:** `gemini-2.5-flash`
- **Request Configuration:** Generates JSON output conforming to Zod schemas. Enforces a 20-second connection timeout and limits retry options to 2 attempts.
- **Multi-Agent Sequence:** Run sequentially under `src/lib/ai/orchestrator.ts`:
  1. *Context Analyzer:* Focus risks and focus minutes lost.
  2. *Carbon & Cost Estimator:* Hidden costs, opportunity costs, revenue loss, and electricity costs.
  3. *Optimizer:* Focus Score, Hidden Cost Score, and recommendation options.
  4. *Action Recommender:* Best milestone action.

### 2. Hedera Consensus Service (HCS)
- **Client Wrapper:** `src/lib/hedera/client.ts`
- **Credentials:** Operator account ID, private key (supporting ECDSA, ED25519, DER formats), target network, and HCS topic ID.
- **Transaction:** Submits milestone payloads as `TopicMessageSubmitTransaction` messages. Retrieves receipts and records to log consensus timestamps and transaction IDs.
- **Honest Simulation Fallback:** If operator credentials or the topic ID are missing, the system logs a simulated record without generating fake ledger hashes.

### 3. Firebase Cloud Firestore
- **Client Wrapper:** `src/lib/firebase/admin.ts`
- **Configuration:** Service account credentials initialized server-side. Enforces Firestore settings option `ignoreUndefinedProperties: true` to prevent crashes when optional properties are undefined.
- **Storage:** Persists and queries session documents.

---

## 17. Config / Environment / Build / Deployment

### Required Environment Variables (`.env.local`)
- `ANONYMOUS_SESSION_SECRET`: Session signature secret (required in production, minimum 32 characters).
- `GEMINI_API_KEY`: API key for Gemini. Falls back to the local calculation engine if omitted.
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`: Service account credentials for Firestore.
- `HEDERA_ACCOUNT_ID` / `HEDERA_PRIVATE_KEY` / `HEDERA_NETWORK` / `HEDERA_TOPIC_ID`: Hedera operator credentials and topic ID. Falls back to simulated mode if omitted.

### Build and Compilation Scripts
- **Compilation:** `npm run build` (runs the Next.js build compiler).
- **TypeScript Check:** `npm run type-check` (executes `tsc --noEmit`).
- **Linter:** `npm run lint` (runs ESLint checks).
- **Test Runner:** `npm test` (runs Vitest suites).
- **HCS Topic Bootstrapper:** `npm run create-topic` (runs `ts-node scripts/create-hedera-topic.ts` to bootstrap topics).

---

## 18. Important File-by-File Notes

### Server Domain Logic (`src/lib/*`)

#### [orchestrator.ts](file:///j:/Saas/green-agent/src/lib/ai/orchestrator.ts)
- Exposes `runAnalysis` which chains the four Gemini prompts sequentially.
- Automatically handles exceptions and falls back to `createFallbackAnalysis`.

#### [gemini.ts](file:///j:/Saas/green-agent/src/lib/ai/gemini.ts)
- Initializes the Gemini SDK client.
- Targets `gemini-2.5-flash` for reliable demo execution. Enforces a 20-second timeout.
- Converts Zod schemas into JSON schemas using `z.toJSONSchema` to enforce structured JSON output.

#### [fallback.ts](file:///j:/Saas/green-agent/src/lib/ai/fallback.ts)
- Exposes `createFallbackAnalysis` to compute Focus and Hidden Cost scores and recommendations deterministically based on input parameters.

#### [score.ts](file:///j:/Saas/green-agent/src/lib/utils/score.ts)
- Computes focus score deductions based on tabs and screen hours.
- Estimates attention leakage in minutes and maps it to revenue loss based on the effective hourly rate.
- Formats currency strings.

#### [admin.ts](file:///j:/Saas/green-agent/src/lib/firebase/admin.ts)
- Exposes `getAdminFirestore` to initialize Firebase Admin.
- Applies `ignoreUndefinedProperties: true` to prevent Firestore write crashes when optional fields are undefined.

#### [sessions.ts](file:///j:/Saas/green-agent/src/lib/firebase/sessions.ts)
- Implements `sessionStore` for saving, retrieving, and listing user sessions.
- Uses a promise queue `localWriteQueue` in development to serialize concurrent file writes and prevent collisions.
- Restricts local file fallback writes strictly to non-production environments.

#### [client.ts](file:///j:/Saas/green-agent/src/lib/hedera/client.ts)
- Manages connection operator clients and submits milestone messages to HCS.
- Resolves key formats and handles signature exceptions.

#### [milestone-payload.ts](file:///j:/Saas/green-agent/src/lib/hedera/milestone-payload.ts)
- Standardizes the `SUSTAINABLE_WORK_MILESTONE` payload format submitted to HCS.

#### [identity.ts](file:///j:/Saas/green-agent/src/lib/security/identity.ts)
- Exposes `createIdentityToken` and `verifyIdentityToken` to create and sign HttpOnly session cookies.
- Employs timing-safe checks (`crypto.timingSafeEqual`) to protect token signatures.

#### [rate-limit.ts](file:///j:/Saas/green-agent/src/lib/security/rate-limit.ts)
- Implements a simple in-memory rate limiter using a JS `Map` to track client requests.

#### [greenagent.ts](file:///j:/Saas/green-agent/src/lib/validations/greenagent.ts)
- Declares Zod schemas for request validation and API payloads.
- Includes backward-compatibility transformations for legacy session schemas (e.g., mapping `carbonScore` to `hiddenCostScore`).

---

## 19. Strengths of the Current Codebase

- **Extensive Test Coverage:** Contains 47 comprehensive unit and integration tests passing under Vitest, verifying orchestrators, validation schemas, and controllers.
- **Graceful Error Recovery:** Incorporates robust local math fallbacks and simulation modes, ensuring the application remains functional even if Gemini, Firestore, or Hedera are unavailable.
- **Secure Architecture:** Sensitive API operations and keys are isolated on the server. Identity tokens are signed cryptographically and stored in secure cookies.
- **Strict Data Validation:** Enforces parameter boundaries via Zod schemas, mitigating risks from malformed inputs or unexpected AI outputs.
- **Backward-Compatible Schemas:** Validation schemas convert legacy session fields (e.g., mapping `carbonScore` to `hiddenCostScore`) dynamically, ensuring data integrity when loading older sessions.

---

## 20. Weaknesses, Risks & Tech Debt

- **In-Memory Rate Limiting:** The API rate limiter relies on an in-memory map. On multi-instance serverless deployments (such as Vercel), rate limits are not shared across server instances.
  - *Fix:* Replace the in-memory map with a distributed rate limiter (e.g., Redis or Upstash).
- **API Latency:** The sequential four-agent Gemini chain can cause latency issues (often taking 3 to 6 seconds).
  - *Fix:* Optimize prompts or parallelize agent calls where possible.
- **Mixed-Currency History Totals:** The history dashboard aggregates total revenue loss and opportunity logged directly, which can result in inaccurate sums if the user changes currencies across different sessions.
  - *Fix:* Group historical totals by currency or normalize values using a base rate.
- **Preset Buttons Layout Overflow:** On extremely narrow mobile screens (e.g., 320px), long text inside preset buttons (like "Admin / Communication") can overflow the button grid boundaries.
  - *Fix:* Apply CSS truncations or use flexible layouts for smaller screens.

---

## 21. Incomplete, Unclear & Inferred Areas

### Unconfigured Integrations
Because external API credentials were not configured in the workspace, the following integrations were verified via simulated code paths and mock tests:
1. **Live Gemini Responses:** The AI pipeline schema validation is fully tested, but the accuracy and response quality of the live model under varying inputs remains inferred.
2. **Live Firebase Firestore Connections:** Database read and write operations are validated via mocked tests, but performance under live Firestore traffic remains unverified.
3. **Live Hedera Topic Submissions:** Ledger publishing logic is verified via mock tests and simulated receipts, but live network confirmation and explorer redirection on HashScan remain unverified.

---

## 22. Glossary of Important Internal Terms

- **Sustainable Work Milestone:** A verified log structure published to Hedera representing completed focus optimization achievements.
- **Focus Score:** A 0-100 metric indicating the efficiency of converting screen time into billable earnings.
- **Hidden Cost Score:** A 0-100 metric indicating the minimization of attention leakage, energy waste, and digital carbon footprints.
- **Fallback Engine:** The local math-based calculation module used when the Gemini API is offline.
- **Anonymous Identity Token:** An HMAC-signed cookie containing a client UUID used to isolate user histories.
- **HCS (Hedera Consensus Service):** A decentralized service on the Hedera network used to log verified proofs.

---

## 23. Concise "Explain This Project to Another LLM" Summary

```markdown
# GreenAgent Handoff Summary

GreenAgent is a full-stack Next.js 16 productivity and sustainability copilot for freelancers. It maps workspace variables (browser tab density, screen hours, active tasks, hourly rates, and billable percentages) to Focus Scores (earning focus efficiency), Hidden Cost Scores (digital waste minimization), and estimated revenue loss.

### Tech Stack
- **Framework:** Next.js 16.2.7 (App Router), React 19.2.4, TypeScript 5.x
- **Styles & UI:** Tailwind CSS v4, Radix/Base UI icons, Lucide vector icons
- **AI Core:** `@google/genai` (utilizing `gemini-2.5-flash` with structured JSON output configurations)
- **Database:** Firebase Admin SDK / Firestore
- **Web3 Ledger:** `@hashgraph/sdk` (Hedera HCS integration)
- **Testing:** Vitest (47 tests passing)

### Codebase Organization
- `src/app/api/`: JSON endpoints for identity cookies, analytics requests, history retrieval, and Hedera submissions.
- `src/lib/`: Server-side libraries handling Gemini orchestration, Firebase sessions, Hedera ledger calls, and security filters.
- `src/components/`: Frontend UI layouts, metrics score cards, SVG trend charts, and intake forms.

### Architecture & Data Flow
1. **Authentication:** Uses HMAC-SHA256 signed HttpOnly anonymous session cookies to isolate user histories.
2. **AI Chain:** Sequentially chains four Gemini prompts (Context Analyzer -> Carbon Cost Estimator -> Optimizer -> Action Recommender) using JSON schemas. Automatically falls back to local mathematical calculations if a query fails.
3. **Ledger Proofs:** Publishes structured milestones to an HCS Topic. If credentials are missing, the system displays simulated transaction proofs.
4. **Data Persistence:** Uses Firestore in production and falls back to local JSON file persistence in development/testing.

### Architecture Risks & Priorities
- **Rate Limiting:** Uses an in-memory limiter. Replace with a distributed store (e.g., Redis) for production.
- **Currency Aggregation:** History totals sum values directly without currency normalization.
- **Sequential API Latency:** Chaining four Gemini calls can cause latency issues in live demos.
```
