# GreenAgent Feature Completion Matrix

Status definitions: **Complete** = code and local verification prove the requirement; **Partial** = implementation exists but live external verification or polish remains; **Missing** = not implemented.

| Area | Requirement | Status | Evidence | Issue | Priority |
|---|---|---|---|---|---|
| Input Form | Tabs/hours/tasks/mode fields | Complete | `src/components/analysis-form.tsx` | None | P2 |
| Input Form | Labels and validation | Complete | Associated labels; client + `AnalyzeRequestSchema` | None | P2 |
| Input Form | Tabs 0–300, hours 0–24, tasks required/bounded | Complete | UI controls + Zod | None | P2 |
| Input Form | Quick templates | Complete | Four form templates | None | P2 |
| Input Form | Mobile/desktop usability | Complete | Browser 320/768/1024/1440 | None | P2 |
| Multi-Agent | Four explicit agents | Complete | `src/lib/ai/prompts.ts` | None | P2 |
| Multi-Agent | Sequential orchestration | Complete | `src/lib/ai/orchestrator.ts` | Four calls increase latency | P2 |
| Multi-Agent | Structured JSON and validation | Complete | `responseJsonSchema` + Zod schemas | Live Gemini unverified | P0 |
| Multi-Agent | Retry/timeout/fallback | Complete | `gemini.ts`, `fallback.ts` | Whole-chain fallback | P1 |
| Gemini | Required model | Complete | `GEMINI_MODEL` | Live model unverified | P0 |
| Gemini | Server-only key | Complete | Server library only | None | P2 |
| Gemini | Prompt injection guardrail | Complete | Prompts mark input untrusted; bounded tasks | Not a full model security boundary | P1 |
| Scores | Focus and carbon scores displayed | Complete | `score-card.tsx` | None | P2 |
| Scores | Scores normalized 0–100 | Complete | Zod + deterministic fallback | None | P2 |
| Scores | Higher-score meaning clear | Complete | UI interpretation copy | None | P2 |
| Scores | Stored in session | Complete | Validated session store | Live Firestore unverified | P0 |
| Recommendations | Dynamic 3–4 recommendations | Partial | Optimizer schema + orchestration | Live Gemini unverified | P0 |
| Recommendations | All required fields | Complete | Recommendation schema/cards | None | P2 |
| Recommendations | Select and log action | Complete | Native selection button + Hedera route | None | P2 |
| Hedera | SDK server integration | Complete | `src/lib/hedera/client.ts` | Live transaction unverified | P0 |
| Hedera | Safe env/network handling | Complete | `.env.local.example`, network resolver | None | P2 |
| Hedera | Topic creation process | Complete | `scripts/create-hedera-topic.ts` | Requires credentials | P0 |
| Hedera | Required message payload | Complete | Log-action route | Live payload unverified | P0 |
| Hedera | Real ID/status/consensus time path | Partial | SDK response + record handling | Live transaction unverified | P0 |
| Hedera | No fake IDs / truthful simulation | Complete | Client, API, confirmation UI | None | P2 |
| Hedera | Session update after logging | Complete | Validated save after result | Live Firestore unverified | P0 |
| History | `/history` exists | Complete | `src/app/history/page.tsx` | None | P2 |
| History | Signed anonymous ownership | Complete | Identity cookie + route checks | Browser-bound identity | P1 |
| History | Newest-first bounded fetch | Complete | Firestore/local store | No UI pagination | P2 |
| History | Required item details/status | Complete | History cards | None | P2 |
| History | Empty/loading/error states | Complete | History page | None | P2 |
| Firebase | Admin server integration | Partial | `src/lib/firebase/admin.ts` | Live Firestore unverified | P0 |
| Firebase | Runtime session validation | Complete | `GreenAgentSessionSchema` | None | P2 |
| Firebase | Production-safe strategy | Complete | Production rejects file fallback | Requires correct deployment env | P0 |
| Firebase | Index/deployment config | Complete | `firebase.json`, `firestore.indexes.json` | Index not deployed here | P0 |
| API | Thin, validated routes | Complete | API routes + `src/lib/http/api.ts` | None | P2 |
| API | Safe status/error handling | Complete | Runtime `400/401/404/429` probes | None | P2 |
| API | Ownership checks | Complete | Runtime cross-owner `404` | None | P2 |
| API | Abuse protection | Partial | Bounded body + in-memory rate limits | Not distributed | P1 |
| UI/UX | Visual polish and demo story | Complete | Browser verification | Some small text | P2 |
| UI/UX | Accessibility baseline | Complete | Labels, headings, native buttons, ARIA progress | No formal WCAG audit | P2 |
| UI/UX | Responsive layouts | Complete | No overflow at target widths | None | P2 |
| UI/UX | Truthful Hedera confirmation | Complete | Simulated/confirmed variants | None | P2 |
| Security | Secrets server-only/ignored | Complete | Env example, imports, `.gitignore` | None | P2 |
| Security | Signed HttpOnly identity | Complete | `src/lib/security/identity.ts` | Not full authentication | P1 |
| Security | Security headers | Complete | `next.config.ts`, runtime CSP probe | CSP allows inline styles/scripts for Next | P2 |
| Security | Dependency hygiene | Partial | No high/critical audit findings | 20 moderate/low transitive advisories | P1 |
| Performance | Bounded storage reads | Complete | History limit 20/max 50 | Local store rewrites full file | P2 |
| Performance | AI latency controls | Partial | Timeout/retries | Four sequential calls | P1 |
| Documentation | Complete setup/deploy/demo docs | Complete | `README.md`, design spec | Live screenshots/video absent | P2 |
| Testing | Lint/type/test/build scripts | Complete | All pass | None | P2 |
| Testing | Automated tests | Complete | 8 files, 23 tests | No live integration tests | P1 |
| Testing | CI quality gates | Complete | `.github/workflows/ci.yml` | Not run on remote yet | P1 |
| Scope | Avoids out-of-scope overbuild | Complete | Repository review | None | P2 |
