# GreenAgent Design Specification

**Tagline:** Get more focused work done while reducing your digital carbon footprint.
**Updated:** 2026-06-05

## Product Boundary

GreenAgent is a Next.js 16 App Router MVP. It analyzes a user-provided work session through a sequential Gemini multi-agent chain, recommends productivity and sustainability actions, stores the session, and optionally logs a selected action through Hedera Consensus Service.

Digital carbon scores are educational behavioral estimates. They are not measured emissions.

## Runtime Flow

```txt
Browser
  -> POST /api/identity
     -> signed HttpOnly anonymous identity cookie
  -> POST /api/analyze
     -> Context Analyzer
     -> Carbon Estimator
     -> Optimizer
     -> Action Recommender
     -> validated session persistence
  -> POST /api/hedera/log-action
     -> owner verification
     -> real HCS submission or explicit simulation
     -> session update
```

`GET /api/history` and `GET /api/session/[id]` only return sessions owned by the signed browser identity.

## AI Contract

- Model: `gemini-3-flash-preview`.
- Every agent has a separate prompt and Zod output schema.
- Gemini receives a JSON response schema.
- Calls have a timeout and bounded retry behavior.
- Scores must be finite values from 0 to 100.
- Optimizer output must contain 3–4 complete recommendations.
- The best action title is bound to one validated recommendation.
- Missing or invalid Gemini output triggers deterministic local fallback.

## Persistence Contract

- Production requires Firebase Admin credentials and uses the `sessions` Firestore collection.
- Development/test may use `data/local_sessions.json`.
- All persisted and loaded session documents pass `GreenAgentSessionSchema`.
- History reads are bounded and sorted newest first.
- Local-file persistence is never treated as production-ready.

## Hedera Contract

- Supported networks: testnet, previewnet, and mainnet.
- Operator credentials, network, and topic ID remain server-side.
- A real submission returns the SDK transaction ID, receipt status, and transaction record consensus timestamp.
- Missing credentials return `status: "simulated"` plus a reason.
- Simulated results contain no fake topic ID or transaction ID and never claim ledger confirmation.

## Security Boundary

- Browser identity is a signed, HttpOnly, SameSite=Lax cookie.
- Production requires `ANONYMOUS_SESSION_SECRET`.
- Session/history/Hedera routes enforce ownership.
- Analyze and Hedera routes validate bounded bodies and apply per-instance rate limits.
- API errors expose safe messages rather than raw internal exceptions.
- Global response headers set CSP, clickjacking, MIME sniffing, referrer, and permissions protections.

## UI Principles

- Calming green/blue visual system with clear productivity and sustainability separation.
- Responsive from 320px through desktop.
- Associated form labels, keyboard-operable recommendation selection, semantic headings, accessible progress indicators, and visible loading/error/empty states.
- Real and simulated Hedera outcomes are visually and verbally distinct.

## Deployment Requirements

- Vercel production environment must include the identity secret and Firebase Admin credentials.
- Firestore indexes in `firestore.indexes.json` must be deployed.
- Real Gemini and Hedera claims require a deployment verification run with project credentials.
- In-memory rate limits are sufficient for a hackathon MVP but require distributed storage before sustained public traffic.
