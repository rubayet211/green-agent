# GreenAgent

**Help freelancers and remote workers earn more by optimizing focus while reducing digital waste and carbon impact.**

GreenAgent is an AI-powered productivity copilot that analyzes digital work habits and delivers personalized recommendations to help freelancers and remote workers increase their effective earning while lowering their digital carbon footprint, with actions logged as verifiable records on Hedera.

## Why GreenAgent Matters

Freelancers do not only lose focus when their digital workspace becomes chaotic - they lose billable earning potential. GreenAgent turns invisible digital waste into understandable scores and practical actions, helping users protect their time, income, and environmental impact.

## Problem

Freelancers, remote developers, content creators, remote digital professionals, and emerging-market workers often spend long hours online while juggling many tabs, messages, research trails, and admin tasks. That creates hidden cost: lost income from poor focus, electricity and digital waste, and avoidable carbon impact.

## Solution

GreenAgent estimates how much money, focus, and sustainability impact a work session may be losing, then recommends practical actions with estimated time and financial benefit. A selected action can be recorded as a **Sustainable Work Milestone** on Hedera Consensus Service.

## Core Features

- Freelancer-focused session form with presets for Client Project, Proposal Writing, Research, Content Creation, Deep Work, and Admin / Communication.
- Optional hourly rate, billable percentage, and currency fields: USD, BDT, INR, EUR, GBP.
- Focus Score showing how efficiently time converts into earning potential.
- Hidden Cost Score showing how low estimated lost earning, energy waste, and digital carbon impact are.
- Estimated revenue loss, time lost, electricity cost, and digital waste level.
- Upgraded recommendation cards with time saved, financial benefit, productivity benefit, sustainability benefit, difficulty, and impact.
- Hedera Sustainable Work Milestone logging with honest simulation mode when credentials are missing.
- History and session detail views with lightweight Focus / Hidden Cost trend charts and legacy `carbonScore` compatibility.

## Metric Explanation

**Focus Score** is a 0-100 directional score for earning focus. Higher means the session is better aligned with billable or high-value output.

**Hidden Cost Score** is a 0-100 directional score for hidden digital cost. Higher means lower estimated lost earning, lower digital waste, and lower behavioral carbon / energy impact. It is not an exact financial or scientific carbon calculation.

**Billable percentage** calibrates revenue estimates so GreenAgent does not treat all screen time as paid work. If omitted, fallback scoring uses a conservative 70% billable assumption.

## Multi-Agent Flow

1. Context Analyzer estimates focus risks and potential lost earning minutes.
2. Carbon & Cost Estimator estimates hidden digital cost, electricity impact, and sustainability risk.
3. Optimizer creates Focus Score, Hidden Cost Score, and 3-4 recommendations.
4. Action Recommender selects the best Sustainable Work Milestone.

If Gemini is unavailable or invalid, the deterministic fallback engine produces bounded estimates and recommendations.

## Hedera Usage

GreenAgent logs selected actions as `SUSTAINABLE_WORK_MILESTONE` HCS messages. Live transactions include topic ID, transaction ID, consensus timestamp, network, action title, estimated financial benefit, and Hidden Cost Score. Simulation mode clearly says no live Hedera transaction was created and does not generate fake transaction IDs.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/Base UI style components
- Gemini via `@google/genai` using `gemini-2.5-flash` as the primary model for availability and demo reliability.
- Firebase Admin SDK / Firestore
- Local development persistence fallback
- Hedera SDK / HCS
- Zod validation
- Vitest

## Architecture Overview

- `src/app/api/analyze/route.ts` validates input, runs AI/fallback analysis, saves sessions.
- `src/lib/ai/*` contains Gemini calls, prompts, orchestration, and fallback scoring.
- `src/lib/validations/greenagent.ts` owns request, agent, and session schemas.
- `src/lib/firebase/sessions.ts` stores sessions in Firestore or local fallback storage.
- `src/app/api/hedera/log-action/route.ts` validates ownership and logs milestones.
- `src/components/*` renders the dashboard, score cards, recommendations, history, and Hedera confirmation.

## Environment Variables

```bash
GEMINI_API_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
HEDERA_TOPIC_ID=
HEDERA_NETWORK=testnet

ANONYMOUS_SESSION_SECRET=
```

Never expose these in client code. Gemini, Firebase Admin, Hedera, and identity signing stay server-side.

## Firebase Setup

1. Create a Firebase project.
2. Enable Firestore in Native mode.
3. Create a service account.
4. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
5. Deploy or apply indexes from `firestore.indexes.json` if Firestore asks for them.

## Gemini Setup

1. Create a Gemini API key.
2. Set `GEMINI_API_KEY`.
3. Run the app and submit a session.
4. The UI shows fallback status only if Gemini is unavailable or invalid.

GreenAgent intentionally uses `gemini-2.5-flash` as the main model. The product can be updated to a newer preview model when availability is reliable, but the MVP prioritizes a stable live-demo path with deterministic fallback when any Gemini call fails validation or times out.

## Hedera Setup

1. Create or use a Hedera testnet account.
2. Set `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`.
3. Create a topic with `npm run create-topic` or the Hedera portal.
4. Set `HEDERA_TOPIC_ID` and `HEDERA_NETWORK=testnet`.
5. Log a milestone and verify the transaction on HashScan before presenting it as live.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test Fallback Mode

Leave Gemini, Firebase, and Hedera credentials unset in development. GreenAgent will use deterministic AI fallback, local session storage, and simulated Hedera milestone status. This is useful for UI demos but not proof of live integrations.

## Test Live Gemini

Set `GEMINI_API_KEY`, run `npm run dev`, submit a work session, and confirm the fallback notice is not shown.

## Test Live Hedera

Set Hedera credentials and `HEDERA_TOPIC_ID`, log a recommendation, then open the HashScan link shown in the confirmation panel.

## Deploy to Vercel

1. Connect the repository to Vercel.
2. Add all required environment variables in the Vercel project.
3. Deploy from the main branch.
4. Run a production smoke test for analysis, Firestore history, and Hedera logging.

## Demo Script for Judges

1. Choose the **Client Project** or **Research** preset.
2. Enter an hourly rate, billable percentage, and submit **Analyze My Work Session**.
3. Explain Focus Score, Hidden Cost Score, and billable calibration.
4. Point out estimated revenue loss and potential focus time lost.
5. Select a recommendation with visible time and financial benefit.
6. Log it as a Sustainable Work Milestone.
7. Show either the real Hedera transaction or the clearly labeled simulation state.

## Known Limitations

- Financial and energy values are directional estimates, not exact calculations.
- Carbon impact is behavioral and qualitative unless a verified emissions model is added.
- Gemini calls are sequential for MVP reliability.
- Local persistence fallback is development-only and blocked in production.
- Old records with `carbonScore` are displayed defensively but new records use `hiddenCostScore`.

## Future Roadmap

- Saved hourly rate profiles per freelancer or project.
- Project-level trend dashboards with action completion tracking.
- Verified energy and emissions calculation model.
- Team and agency work-session analytics.
- More Hedera milestone types and public proof pages.
- Exportable freelancer productivity reports.
