# GreenAgent MVP Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Turn GreenAgent into a secure, truthful, tested, mobile-ready MVP while preserving its focused hackathon scope.

**Architecture:** Route handlers derive ownership from a signed HttpOnly anonymous identity cookie and share bounded-body, rate-limit, and safe-error helpers. Gemini output is validated at every agent boundary and orchestration moves into `lib/ai`; Firestore is required in production, while development fallback remains explicit. Hedera real and simulated results are distinct, and UI copy/semantics reflect actual state.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest, Zod 4, Google Gen AI SDK, Firebase Admin, Hedera SDK, React 19, Tailwind CSS.

---

### Task 1: Test Harness and Security Boundaries

**Files:**
- Modify: `package.json`, `package-lock.json`, `.env.local.example`, `.gitignore`
- Create: `vitest.config.ts`, `src/lib/security/identity.ts`, `src/lib/security/rate-limit.ts`, `src/lib/http/api.ts`
- Test: `src/lib/security/identity.test.ts`, `src/lib/security/rate-limit.test.ts`, `src/lib/http/api.test.ts`

- [x] Write failing tests proving signed identities reject tampering, rate limits reject excess requests, bounded JSON rejects oversized bodies, and Zod errors map to `400`.
- [x] Run `npm test` and confirm tests fail because helpers do not exist.
- [x] Implement minimal helpers and test configuration.
- [x] Run `npm test`, `npm run lint`, and `npx tsc --noEmit`.

### Task 2: Validated AI Orchestration

**Files:**
- Modify: `src/lib/validations/greenagent.ts`, `src/lib/ai/gemini.ts`, `src/app/api/analyze/route.ts`
- Create: `src/lib/ai/fallback.ts`, `src/lib/ai/orchestrator.ts`
- Test: `src/lib/validations/greenagent.test.ts`, `src/lib/ai/orchestrator.test.ts`

- [x] Write failing tests for input length limits, agent output validation, score bounds, 3-4 recommendations, fallback behavior, and required model name.
- [x] Run focused tests and confirm expected failures.
- [x] Add Zod agent/session schemas, `responseJsonSchema`, retries/timeouts, `gemini-3-flash-preview`, and an orchestrator.
- [x] Make analyze route thin, identity-owned, bounded, rate-limited, and safely error-mapped.
- [x] Run focused and full tests, lint, and type check.

### Task 3: Production-Safe Storage and Ownership

**Files:**
- Modify: `src/lib/firebase/sessions.ts`, `src/app/api/history/route.ts`, `src/app/api/session/[id]/route.ts`, `.gitignore`
- Create: `firebase.json`, `firestore.indexes.json`
- Test: `src/lib/firebase/sessions.test.ts`

- [x] Write failing tests proving production rejects missing Firestore and session reads enforce owner identity.
- [x] Run focused tests and confirm expected failures.
- [x] Make local fallback explicit and development-only, validate stored sessions, limit history reads, and remove silent Firestore-to-local fallback.
- [x] Enforce owner identity in history and session routes.
- [x] Run tests, lint, and type check.

### Task 4: Truthful Hedera Logging

**Files:**
- Modify: `src/lib/hedera/client.ts`, `src/app/api/hedera/log-action/route.ts`, `src/types/greenagent.ts`
- Test: `src/lib/hedera/client.test.ts`

- [x] Write failing tests for network selection, missing-config simulated result, real record consensus timestamp/status, and owner-required logging.
- [x] Run focused tests and confirm expected failures.
- [x] Return explicit simulated results without fake transaction IDs, inspect receipt/record for real results, close clients, and honor `HEDERA_NETWORK`.
- [x] Update Hedera route with identity, bounds, rate limit, safe errors, and session persistence.
- [x] Run tests, lint, and type check.

### Task 5: Mobile, Accessibility, and Truthful UI

**Files:**
- Modify: `src/app/page.tsx`, `src/app/history/page.tsx`, `src/app/session/[id]/page.tsx`, `src/components/analysis-form.tsx`, `src/components/app-shell.tsx`, `src/components/recommendation-card.tsx`, `src/components/score-card.tsx`, `src/components/hedera-confirmation.tsx`, `src/app/globals.css`

- [x] Remove client-provided anonymous IDs and initialize signed identity before API calls.
- [x] Associate all form labels, add quick templates, make recommendation selection keyboard/radio accessible, and clarify score direction.
- [x] Distinguish real/simulated Hedera states everywhere, add history best action/error state, and fix heading hierarchy.
- [x] Fix 320px overflow/header overlap and reduce smallest text.
- [x] Run tests, lint, type check, build, and browser checks at 320/768/1024/1440.

### Task 6: Headers, Dependencies, CI, and Documentation

**Files:**
- Modify: `next.config.ts`, `package.json`, `package-lock.json`, `README.md`, `.env.local.example`
- Create: `.github/workflows/ci.yml`
- Delete: `src/lib/firebase/client.ts` if confirmed unused

- [x] Add conservative security headers and type-check/test scripts.
- [x] Pin Hedera SDK to a non-critical-vulnerability dependency path and run `npm audit`.
- [x] Remove unused Firebase client dependency/module if no imports remain.
- [x] Add CI for install, lint, type check, tests, build, and production audit.
- [x] Document real/simulated behavior, Firebase indexes, Vercel requirements, security limits, deployment, roadmap, and known limitations.
- [x] Run complete verification and update audit reports with achieved status and residual external-verification gaps.

### Task 7: Final Review and Verification

- [x] Run `npm install`, `npm run lint`, `npm run type-check`, `npm test`, `npm run build`, and `npm audit --omit=dev`.
- [x] Run fallback browser workflow, Hedera simulated workflow, history/session ownership probes, invalid-body probes, and responsive checks.
- [x] Review diff for correctness, security, accessibility, performance, dead code, and accidental changes.
- [x] Record live-integration limitations if credentials remain unavailable.

