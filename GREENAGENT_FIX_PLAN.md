# GreenAgent Remaining Fix Plan

The original P0/P1 hardening plan has been implemented in code. This file tracks the remaining deployment verification and polish work.

## Completed Critical Work

| Fix | Status | Evidence |
|---|---|---|
| Signed anonymous ownership and route authorization | Complete | `src/lib/security/identity.ts`, API routes, runtime probes |
| Request/body bounds, safe errors, and rate limits | Complete | `src/lib/http/api.ts`, `src/lib/security/rate-limit.ts` |
| Required Gemini model and structured output validation | Complete | `src/lib/ai/gemini.ts`, Zod schemas |
| Modular four-agent orchestration and deterministic fallback | Complete | `src/lib/ai/orchestrator.ts`, `fallback.ts` |
| Truthful Hedera simulation and real receipt/record path | Complete | Hedera library/API/UI |
| Production rejects local-file persistence | Complete | `src/lib/firebase/sessions.ts` |
| Firestore deployment/index configuration | Complete | `firebase.json`, `firestore.indexes.json` |
| Remove critical/high dependency findings | Complete | SDK pin + protobuf override |
| Mobile overflow/accessibility/history fixes | Complete | Components/pages + browser verification |
| Tests, CI, security headers, and documentation | Complete | Vitest, workflow, Next config, README |

## P0 Critical Before Submission

| Order | Fix | Difficulty | Files / Systems |
|---|---|---|---|
| 1 | Configure `ANONYMOUS_SESSION_SECRET`, Firebase Admin, Gemini, and Hedera in a preview deployment | Medium | Vercel environment |
| 2 | Deploy Firestore indexes and verify create/update/history | Easy | Firebase project, `firestore.indexes.json` |
| 3 | Run a real Gemini analysis and verify 3–4 validated recommendations | Easy | Gemini project, deployed app |
| 4 | Submit one real HCS action and verify transaction/status/time on HashScan | Medium | Hedera testnet, deployed app |

## P1 Important

| Fix | Why | Difficulty | Files likely affected |
|---|---|---|---|
| Replace in-memory rate limiting with distributed storage | Per-instance limits do not protect a scaled public deployment | Medium | `src/lib/security/rate-limit.ts`, provider config |
| Add credentialed deployment smoke tests | Protect real integration paths | Hard | New integration test/scripts |
| Add operational logging/health checks | Faster demo diagnosis | Medium | New health route/observability |
| Add Firestore pagination cursor | Improve history at scale | Medium | Store/API/history UI |
| Review remaining moderate/low advisories regularly | Transitive risk remains | Medium | Dependencies |

## P2 Polish

| Fix | Benefit | Difficulty | Files likely affected |
|---|---|---|---|
| Stream actual agent progress | Removes timer-based loading theater | Hard | Analyze API/UI |
| Consolidate home/session results UI | Reduces duplication | Medium | Pages/components |
| Increase smallest text sizes | Better accessibility | Easy | UI components |
| Add screenshots/demo video to README | Faster judge comprehension | Easy | README/assets |
| Run Lighthouse and tune client rendering | Better measured performance | Medium | Pages/components |

## Suggested Implementation Order

1. Configure and deploy a credentialed preview.
2. Verify Firestore, Gemini, and Hedera end to end.
3. Record HashScan evidence and update demo materials.
4. Add distributed rate limiting and smoke tests before public traffic.
5. Complete optional UX/performance polish.

## Submission Verification Checklist

```txt
[x] npm install
[x] npm run lint
[x] npm run type-check
[x] npm test
[x] npm run build
[x] npm audit has no high/critical production findings
[x] Unauthorized session/history requests rejected
[x] Rate limiting returns 429
[x] 320/768/1024/1440 layouts have no horizontal overflow
[x] Simulated Hedera never shows fake IDs or claims confirmation
[ ] Real Gemini chain verified in deployed preview
[ ] Firestore create/update/history verified in deployed preview
[ ] Real Hedera transaction visible on HashScan
```
