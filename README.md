# SignalRank

**Signal-based outbound targeting that improves with every correction.**

SignalRank is a B2B outbound targeting tool that generates Draft ICP Hypotheses from company profiles, enables human verification, and produces ranked buyer recommendations based on signal-based scoring. Each correction improves future targeting accuracy.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Next.js App Router                  │
│                                                      │
│  Dashboard → Intake → ICP Generation → Verification  │
│                  → Ranked Leads → Learning Loop       │
├──────────────────────────────────────────────────────┤
│                   API Route Handlers                  │
│  /api/projects  /api/projects/[id]/generate-icp      │
│  /api/projects/[id]/verify-icp                       │
│  /api/projects/[id]/generate-leads  /api/feedback    │
├──────────────────────────────────────────────────────┤
│              Mock Engines (Deterministic)             │
│  mockIcpGenerator.ts    mockLeadRanker.ts            │
│  mockLeadPool.ts        mockData.ts                  │
├──────────────────────────────────────────────────────┤
│             Prisma ORM + SQLite Database              │
│  Project  ICPGeneration  LeadRecommendation          │
│  SegmentTemplate  FeedbackEvent                      │
└──────────────────────────────────────────────────────┘
```

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Prisma, SQLite

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run database migration
npx prisma migrate dev

# 3. Seed demo data
npm run seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3-Minute Investor Demo Script

### Opening (30 seconds)
1. Open the **Dashboard** at `/`
2. Point out: 6 projects in various stages — Draft, ICP Generated, ICP Verified, Leads Ranked
3. Explain: "This is SignalRank — signal-based outbound targeting that improves with every human correction."

### ICP Generation (45 seconds)
4. Click into **Acme Cybersecurity** (Leads Ranked status)
5. Show the **ICP Generation page** — the Draft ICP Hypothesis
6. Point out: pain points, buyer titles, target traits, excluded traits, confidence score
7. Note the side panel: "This is a hypothesis, not a guarantee."

### ICP Verification (30 seconds)
8. Click **Edit & Verify ICP** to see the verification page
9. Show side-by-side: original draft vs human-verified ICP
10. Explain: "The user corrects the draft — this correction data is stored and improves future generation."

### Ranked Leads (45 seconds)
11. Navigate to the **Ranked Leads** page
12. Show stat cards: total accounts, top-tier accounts, estimated call reduction, average fit score
13. Point out the **Estimated Efficiency Gain** card: "~90% call reduction vs broad outbound — this is a scenario estimate."
14. Scroll through the ranked table — fit scores, confidence levels, "Why Recommended" summaries
15. Click a row to open the **Lead Detail Drawer** — show matched pain points, signal tags, reasons

### Learning Loop (30 seconds)
16. Navigate to the **Learning / Knowledge** page
17. Show the ICP evolution: original vs corrected, delta view
18. Point to the **Reusable Segment Template** card
19. Read the learning loop narrative: "Each correction improves future ICP generation and ranking for similar segments."

### New Project (optional, 15 seconds)
20. Click **New Project** in the sidebar
21. Fill in a quick example and click **Generate Draft ICP**
22. Show: the system generates a new ICP hypothesis in seconds

---

## What Is Mocked vs. Real

| Feature | Current (Demo) | Production |
|---|---|---|
| ICP Generation | Deterministic rules engine using industry/region/size mappings | LLM-based analysis of website content, job postings, tech stack |
| Lead Pool | 75+ hardcoded mock candidates in `mockLeadPool.ts` | Integration with data providers (Apollo, ZoomInfo, LinkedIn) |
| Lead Scoring | Weighted scoring on industry/region/size/title/pain-point overlap | ML model trained on historical conversion data |
| Website Analysis | Domain keyword matching | Real web scraping and content analysis |
| Feedback Loop | Stored in DB but not used for re-ranking | Active learning — feedback retrains scoring model |
| Segment Templates | Pre-seeded templates | Auto-generated from verified ICP corrections |
| Authentication | None | SSO, team-based access control |
| CRM Integration | None | Salesforce, HubSpot sync for outcome feedback |

---

## Data Model

- **Project** — Company being analyzed (name, website, industry, region, size, status)
- **ICPGeneration** — Generated ICP (initial draft or corrected version)
- **LeadRecommendation** — Scored and ranked lead with fit score, confidence, reasons, signals
- **SegmentTemplate** — Reusable ICP template per industry/region/size segment
- **FeedbackEvent** — User feedback on lead quality (good fit, bad fit, contacted, converted)

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Global layout with sidebar
│   ├── page.tsx                # Dashboard
│   ├── globals.css             # Tailwind + shadcn theme
│   ├── projects/
│   │   ├── new/page.tsx        # New project intake form
│   │   └── [id]/
│   │       ├── icp/page.tsx    # ICP generation view
│   │       ├── verify/page.tsx # Side-by-side ICP verification
│   │       ├── leads/          # Ranked leads + client component
│   │       └── learning/page.tsx # Learning loop page
│   └── api/                    # Route handlers
├── components/                 # Reusable UI components
├── lib/                        # Mock engines, data, utilities
├── prisma/
│   ├── schema.prisma           # Data model
│   └── seed.ts                 # Demo data seeder
└── README.md
```
