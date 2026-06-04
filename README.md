# GreenAgent

**Get more focused work done while reducing your digital carbon footprint.**

GreenAgent is a multi-agent productivity copilot built for the Beyond Tomorrow Summit 2026 Hackathon. It analyzes a work session, produces validated focus and sustainability scores, recommends practical actions, and can record a selected action through Hedera Consensus Service.

## What It Does

- Captures tabs, screen hours, tasks, and work mode with reusable quick templates.
- Runs a sequential four-agent Gemini workflow:
  1. Context Analyzer
  2. Carbon Estimator
  3. Optimizer
  4. Action Recommender
- Validates every AI response with Zod and falls back to deterministic local analysis when Gemini is unavailable or invalid.
- Stores sessions in Firestore in production and a local JSON file in development/test.
- Submits selected actions to Hedera when configured.
- Clearly labels unconfigured Hedera activity as simulated and never creates fake transaction IDs.
- Keeps history private to a signed anonymous browser identity.

## Architecture

```txt
Browser
  -> signed HttpOnly anonymous identity cookie
  -> Next.js App Router API routes
     -> lib/ai: Gemini orchestration + validated fallback
     -> lib/firebase: validated session persistence + ownership checks
     -> lib/hedera: HCS submission + receipt/record verification
```

Core stack: Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Zod, `@google/genai`, Firebase Admin, and `@hashgraph/sdk`.

## Local Setup

Requirements: Node.js 22 and npm.

```bash
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without third-party credentials, development mode uses deterministic Gemini fallback analysis, local session storage, and explicitly simulated Hedera results. This supports UI evaluation but does not prove live integrations.

## Environment

```env
# Required in production
ANONYMOUS_SESSION_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Optional; enables live Gemini
GEMINI_API_KEY=

# Optional; enables live Hedera logging
HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=
```

GreenAgent uses `gemini-3-flash-preview`. Gemini and Hedera credentials are server-side only.

Generate an identity secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Firebase Setup

1. Create a Firebase project and service account.
2. Put the Admin SDK values in `.env.local`.
3. Create Firestore in Native mode.
4. Deploy the included history index:

```bash
npx firebase-tools deploy --only firestore:indexes
```

Production deliberately fails session writes when Firebase Admin is not configured. Local JSON persistence exists only in development/test and is not suitable for Vercel.

## Hedera Setup

Configure an operator account and network, then create an HCS topic:

```bash
npm run create-topic
```

Copy the returned topic ID to `HEDERA_TOPIC_ID`. A successful app submission returns the real topic ID, transaction ID, receipt status, and consensus timestamp. Missing configuration returns a `simulated` status with a reason and no fake ledger identifiers.

## Verification

```bash
npm run lint
npm run type-check
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

GitHub Actions runs the same quality gates.

## Deploy To Vercel

1. Configure all production-required environment variables in Vercel.
2. Deploy the Firestore index.
3. Deploy the app.
4. Verify a real Gemini analysis, Firestore history entry, and Hedera transaction on HashScan before presenting them as live.

Security notes:

- Anonymous ownership uses a signed HttpOnly cookie. It is not account authentication and does not synchronize across browsers.
- Rate limiting is in-memory per application instance; use a distributed rate limiter before sustained public traffic.
- Carbon scoring is an educational behavioral estimate, not a measured emissions calculation.

## Demo Script

1. Choose **Research Mode** or enter 115 tabs, 12 hours, and a research-heavy task list.
2. Select **Analyze with GreenAgent**.
3. Explain the validated four-agent sequence and compare Focus and Carbon scores.
4. Select a recommendation and log it.
5. If Hedera is configured, open the real HashScan transaction. Otherwise, explicitly show the simulated status.
6. Open **History** to show the persisted session and action status.

## Known Limitations

- Live Gemini, Firestore, and Hedera behavior requires project-specific credentials and must be verified in the target deployment.
- A failure in any Gemini agent currently switches the complete analysis to deterministic fallback.
- Four sequential Gemini calls prioritize agent clarity over minimum latency.
- Anonymous sessions are browser-bound rather than user accounts.

## Roadmap

- Distributed rate limiting and observability.
- Partial-agent recovery and streamed progress.
- Firestore-backed pagination.
- Optional authenticated cross-device history.
