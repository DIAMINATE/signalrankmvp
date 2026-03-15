# SignalRank

Signal-based outbound targeting that improves with every correction.

SignalRank helps B2B teams generate Draft ICP Hypotheses, verify them with human expertise, and produce ranked buyer recommendations. Each correction improves future targeting accuracy.

**Demo company: Clay** — a data enrichment and outbound automation platform.

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No database or API keys required. All data is client-side and deterministic.

---

## Deploy to GitHub Pages

```bash
npm run build
```

The `out/` directory is a fully static site ready for GitHub Pages. Configure your repo to serve from the `out/` folder or copy its contents to a `gh-pages` branch.

**ICP extraction on deployment:** To enable website-based ICP extraction when deployed, see [DEPLOYMENT.md](DEPLOYMENT.md) for Railway + GitHub Actions setup.

---

## Architecture

```
Next.js Static Export (output: "export")
├── Client-side React Context store (no database)
├── Deterministic mock ICP generator (rules engine)
├── Deterministic mock lead ranker (weighted scoring)
└── Pre-seeded demo data for Clay
```

- **No server required** — fully static HTML/JS
- **No external APIs** — all logic runs in the browser
- **Pre-seeded data** — demo is ready immediately

---

## 3-Minute Demo Script

1. **Dashboard** — Show 4 Clay targeting segments in various stages
2. **Completed segment** (Mid-Market SaaS) — Click through to ICP page
3. **ICP** — Show the verified ICP: pain points, buyer titles, traits, confidence
4. **Verify** — Show side-by-side: original draft vs human-corrected ICP
5. **Ranked Leads** — Show 25 ranked recommendations (Ramp, Notion, Lattice, Vercel, etc.) with fit scores and confidence. Click a row for the detail drawer.
6. **Learning Loop** — Show ICP evolution, delta, and the learning loop narrative
7. **New Segment** — Create a new segment live. Watch the step-by-step loading animation.

---

## What Is Mocked vs. Real

| Feature | Demo | Production |
|---|---|---|
| ICP Generation | Deterministic rules engine | LLM analysis of website + job postings + tech stack |
| Lead Pool | ~45 hardcoded companies (Ramp, Notion, etc.) | Data providers (Apollo, ZoomInfo, LinkedIn) |
| Lead Scoring | Weighted formula (industry, region, size, title, pain-point overlap) | ML model trained on conversion data |
| Feedback Loop | Stored in memory, not used for re-ranking | Active learning from CRM outcome data |
| Authentication | None | SSO, team-based access |
