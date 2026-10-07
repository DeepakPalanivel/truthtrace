# NewzaX — Explainable Fake News Intelligence System

> Don't just detect fake news. Trace the truth.

NewzaX is not a binary fake/real classifier. It extracts individual claims, evaluates each against available evidence, checks source credibility, detects context manipulation, traces the information propagation path (News DNA), and produces a fully explainable verdict.

---

## Key Differentiator

| Typical Classifier | NewzaX |
|---|---|
| One verdict for the whole article | Claim-level analysis |
| Black box confidence score | Explainable scoring with 5 documented factors |
| No sources | Evidence trail with supporting/contradicting sources |
| No context checking | Dedicated context manipulation detection |
| No propagation history | News DNA visualization |
| Works with API only | Full Demo Mode with 3 realistic labeled cases |

---

## Features

- **Claim-level analysis** — individual factual claims are extracted and verified independently
- **Truth Score** — 0–100 weighted score across 5 documented factors
- **Explainable verdict** — every result explains why NewzaX reached its conclusion
- **Evidence trail** — supporting and contradicting sources for each claim
- **Source credibility** — publisher, domain, author, citation, HTTPS signals
- **Context check** — date mismatches, fabricated attribution, context manipulation
- **Language analysis** — clickbait, emotional language, unsupported certainty
- **News DNA** — information propagation path visualization
- **Demo Mode** — 3 realistic labeled cases (no API required)
- **History** — all analyses stored in local SQLite database
- **Responsive** — works on desktop, tablet, and mobile

---

## Architecture

```
NewzaX/
├── frontend/              # React + TypeScript + Tailwind CSS
│   └── src/
│       ├── pages/         # Landing, Analyze, Results, History, About
│       ├── components/    # Layout, Result panels, Charts
│       ├── services/      # API client
│       ├── types/         # TypeScript interfaces
│       └── utils/         # Verdict colors, formatting
│
├── backend/               # Node.js + Express + TypeScript
│   └── src/
│       ├── controllers/   # Request handlers
│       ├── routes/        # API routes
│       ├── services/      # Analysis pipeline, demo data
│       ├── database/      # SQLite init and schema
│       ├── middleware/     # Error handling, rate limiting
│       └── types/         # Shared TypeScript interfaces
│
└── database/              # SQLite DB file (auto-created)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Routing | React Router v6 |
| Icons | Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite via better-sqlite3 |
| AI (optional) | OpenAI GPT-4o-mini or Groq Llama3 |
| URL Scraping | Axios + Cheerio |
| Security | Helmet, express-rate-limit, express-validator |

---

## Installation

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
# Install all (backend + frontend)
cd NewzaX
npm install
npm run install:all
```

Or separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` — no changes required to run in Demo Mode.

### 3. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open: http://localhost:5173


---

## Environment Variables

```env
# backend/.env

PORT=5000
NODE_ENV=development
DB_PATH=./database/NewzaX.db
CORS_ORIGIN=http://localhost:5173

# Optional: AI for live claim analysis (Demo Mode works without these)
OPENAI_API_KEY=sk-...        # OpenAI GPT
GROQ_API_KEY=gsk_...          # Groq (free tier available at console.groq.com)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/analyze | Analyze news (text, URL, or headline) |
| GET | /api/analysis/:id | Get a stored analysis by ID |
| GET | /api/history | Get analysis history (last 50) |
| GET | /api/demo/:case | Load a demo analysis (1, 2, or 3) |
| GET | /health | Server health check |

---

## Demo Mode

NewzaX includes 3 labeled demo cases that work without any API keys:

| Case | Verdict | Description |
|---|---|---|
| 1 | Likely False | Fabricated ₹50,000 government benefit claim |
| 2 | Misleading Context | Old flood image presented as current 2026 news |
| 3 | Likely True | Factual ISRO/NASA NISAR satellite launch report |

Demo analyses are always marked with a "Demo Analysis" badge. Evidence, sources, and verdicts in demo mode are synthetic illustrative data — not real-world fact-checking results.

---

## How the Scoring Works

The Truth Score (0–100) is a weighted average of 5 independent factors:

| Factor | Weight | What it measures |
|---|---|---|
| Claim Evidence | 35% | Do extracted claims hold up against available evidence? |
| Source Credibility | 20% | Domain, publisher, author, citation, HTTPS signals |
| Cross-Source Agreement | 20% | Do multiple sources corroborate or contradict? |
| Context Consistency | 15% | Is content presented in its correct context? |
| Language Signals | 10% | How much manipulation language is present? |

**Verdict thresholds:**
- 80+ → Likely True
- 65–79 → Probably Accurate
- 45–64 → Unverified
- 30–44 → Likely Misleading
- <30 → Likely False

---

## Limitations

- Evidence retrieval requires external search APIs (not included)
- AI claim extraction quality depends on the configured LLM
- Source credibility scoring is heuristic — a high score does not guarantee accuracy
- Context analysis may miss sophisticated misinformation
- Always verify important claims through multiple trusted sources

---

## Future Improvements

- Live evidence retrieval via Serper / Google Search API
- Real-time social media propagation tracking
- Image reverse search and metadata analysis
- Multi-language support
- Browser extension for in-context analysis
- Historical claim database

