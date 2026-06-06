# GreenAgent

## Tagline

Help freelancers and remote workers earn more by optimizing focus while reducing digital waste and carbon impact.

## Inspiration

Freelancers and remote workers often lose income in ways that are hard to see. A messy browser, too many open tabs, constant context switching, and long unfocused screen sessions can quietly reduce billable output. The same habits also create avoidable digital waste through idle browser activity, repeated loading, and unnecessary energy use.

GreenAgent was built to make that hidden cost visible without pretending the estimates are exact. The goal is to help independent workers protect focused earning time while making more sustainable digital work choices.

## What it does

GreenAgent analyzes a freelancer's work session using tab count, screen hours, main tasks, work mode, optional hourly rate, billable percentage, and currency.

It returns:

- **Focus Score**: how efficiently the session converts time into earning potential.
- **Hidden Cost Score**: how low the estimated hidden cost is across lost earning potential, digital waste, energy use, and carbon impact.
- **Estimated revenue loss** and **estimated focus time lost**.
- 3-4 personalized recommendations with estimated time saved, financial benefit, productivity benefit, sustainability benefit, difficulty, and impact.
- A recommended **Sustainable Work Milestone** that can be logged to Hedera Consensus Service.

If Gemini is unavailable or returns invalid output, GreenAgent uses a deterministic fallback engine so the demo remains honest and usable.

## How we built it

GreenAgent is built with:

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4.
- shadcn/Base UI style components for the dark SaaS interface.
- Gemini multi-agent orchestration using `@google/genai` and `gemini-2.5-flash` for availability.
- Zod schemas for request validation and AI output validation.
- Firebase Admin SDK and Firestore for session persistence.
- Development-only local file fallback for testing.
- Signed HttpOnly anonymous identity cookies for owner-scoped session history.
- Hedera SDK and HCS for milestone logging.

The AI workflow uses four agents: Context Analyzer, Carbon & Cost Estimator, Optimizer, and Action Recommender.

## Hedera usage

GreenAgent logs selected productivity/sustainability actions as verifiable Sustainable Work Milestones on Hedera Consensus Service.

Each HCS message includes the app name, milestone type, timestamp, session ID, Focus Score, Hidden Cost Score, estimated revenue loss, estimated time lost, currency, selected action, estimated financial benefit, estimated time saved, sustainability benefit, and network.

When Hedera credentials or topic ID are missing, GreenAgent shows a clearly labeled simulation state. It does not create fake transaction IDs or pretend a live transaction occurred.

## What makes it unique

Most productivity tools focus on tasks. Most sustainability tools focus on environmental metrics. GreenAgent connects both to the freelancer's real concern: "Am I losing money because of how I work?"

It combines earning potential, focus loss, digital waste, and sustainability into one practical workflow. The user does not just receive a score; they get a concrete action with estimated financial and environmental impact, then can record that action as a Sustainable Work Milestone on Hedera.

The product is also honest about uncertainty. It uses "estimated" and "potential" language, validates AI output, and falls back to deterministic scoring when AI is unavailable.

## Challenges we ran into

- Balancing financial usefulness with honest estimate language.
- Replacing the older carbon-score framing with Hidden Cost Score without breaking legacy sessions.
- Keeping Gemini output structured and validated across a four-agent pipeline.
- Making Hedera logging demo-ready while clearly separating live and simulated states.
- Preserving owner-scoped history with anonymous users instead of requiring full account signup.

## Accomplishments that we're proud of

- Built an upgraded freelancer-focused MVP with Focus Score, Hidden Cost Score, estimated revenue loss, and estimated time lost.
- Added recommendation cards that show time saved, financial benefit, productivity benefit, and sustainability benefit.
- Preserved local fallback behavior so the app remains demoable without external credentials.
- Added Hedera Sustainable Work Milestone logging with honest simulation mode.
- Added history and session detail pages with Focus and Hidden Cost trend summaries.
- Kept secrets server-side and protected sessions with signed HttpOnly anonymous identity cookies.

## What we learned

Freelancer productivity becomes more compelling when it is connected to earning potential, but that connection has to be framed carefully. Estimated revenue loss is useful for prioritization, not a promise of guaranteed income. We also learned that AI features need deterministic fallback paths for hackathon reliability, especially when preview models or third-party services are unavailable.

## What's next

- Add project-level profiles for hourly rate, currency, and billable percentage.
- Add action completion tracking after a Sustainable Work Milestone is logged.
- Improve emissions estimates with a verified energy/carbon model.
- Add public proof pages for Hedera milestones.
- Add exportable freelancer productivity reports for clients or personal review.
- Add team/agency dashboards for distributed remote workers.

## Demo Flow

1. Select a freelancer work preset.
2. Add screen hours, tab count, tasks, hourly rate, billable percentage, and currency.
3. Review Focus Score, Hidden Cost Score, trend history, estimated lost revenue, and time lost.
4. Pick a recommendation with estimated time and financial benefit.
5. Log it as a Sustainable Work Milestone on Hedera or show honest simulation mode.

## Built with

Next.js, React, TypeScript, Tailwind CSS, Gemini, Firebase Admin SDK, Firestore, Hedera Consensus Service, Zod, and Vitest.
