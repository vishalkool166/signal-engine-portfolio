# Signal Engine v5

<div align="center">

![Signal Engine](https://img.shields.io/badge/Signal_Engine-v5.0-00ff88?style=for-the-badge&logoColor=white)
[![Live Demo](https://img.shields.io/badge/🔴_LIVE-signal--engine--v5.vishalkool.top-00ff88?style=for-the-badge)](https://signal-engine-v5.vishalkool.top)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Deployed-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-1C3C3C?style=for-the-badge)](https://langchain-ai.github.io/langgraph)
[![LangSmith](https://img.shields.io/badge/LangSmith-Tracing-FF6B35?style=for-the-badge)](https://smith.langchain.com)

**Automated crypto futures and Indian equity trading intelligence platform.**

*Combines multi-timeframe technical analysis, a LangGraph agent pipeline, RAG intelligence layer, and LangSmith observability — deployed live on AWS and actively iterating based on real trade results.*

[🔴 Live System](https://signal-engine-v5.vishalkool.top) · [📄 Resume](https://github.com/vishalkool166/signal-engine-portfolio/blob/main/RESUME.md)

</div>

---

## 🧠 What Is This?

Signal Engine v5 is a **fully autonomous trading intelligence platform** running 24/7 on AWS EC2. It covers two markets:

**Crypto Futures (Binance)** — Scans 37 coins every 15 minutes across multiple timeframes. Scores each opportunity using ADX trend strength, RSI momentum, and volume confirmation. Filters through a LangGraph agent pipeline before executing on Binance Futures.

**Indian Equity (AngelOne)** — Trades BANKNIFTY and FINNIFTY futures using an Opening Range Breakout strategy. Monitors the 9:15–9:30 IST opening range, validates volatility conditions, and enters SHORT positions on breakdown between 11am–12pm IST.

> *"Build simple. Measure real results. Add complexity only when basics are proven."*
>
> *Grade A signals showing 50% win rate in live trading. Grade B was removed after live data showed 13% win rate. The system actively iterates based on real results.*

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BINANCE FUTURES API                       │
│              OHLCV · Ticker · Funding · OI                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        REDIS LAYER                           │
│         Real-time market data · Ticker · Funding · OI       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SIGNAL ENGINE BRAIN                       │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Data Fetcher│  │  Indicators  │  │  Regime Detector  │  │
│  │ Redis-first │  │ EMA·RSI·ADX  │  │ Trend·Range·Chop  │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         └────────────────┼──────────────────────┘           │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              LANGGRAPH AGENT PIPELINE                 │  │
│  │  regime → trend → risk → grade → sizing → finalize   │  │
│  │  Each step is a node. Each decision is traced.        │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         ADX + RSI + VOLUME CONFLUENCE SCORER          │  │
│  │         Grade A+ · A · F                              │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         LIGHTGBM ML GATE (after 50 trades)            │  │
│  └───────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌────────────────┐  ┌──────────────────┐
│   BINANCE    │  │    TELEGRAM    │  │  INDIAN MARKET   │
│   FUTURES    │  │   BOT ALERTS  │  │  BANKNIFTY/FINNIFTY│
│  EXECUTION   │  │  30+ Commands  │  │  ORB STRATEGY    │
└──────────────┘  └────────────────┘  └──────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              RAG INTELLIGENCE LAYER                          │
│  ChromaDB · sentence-transformers · LangChain · Groq LLM    │
│  5 chunk types · Semantic search · Source attribution        │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│            LANGSMITH OBSERVABILITY                           │
│  Every LangGraph execution · Every RAG query · Latency      │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                   REACT DASHBOARD (PWA)                      │
│         WebSocket push · Real-time PnL · Signal Radar        │
│    RAG Chat Widget · LangSmith Link · Multi-tier SaaS        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Signal Scoring — Current Engine

The scoring engine is intentionally simple. After live trading showed that complex scoring did not outperform basic scoring, the system was stripped back to three proven factors. Complexity will be added back once the baseline is validated.

### Scoring Factors

| Factor | Max Points | What It Checks |
|--------|-----------|----------------|
| **ADX Strength** | 40 | Trend strength — is the market actually trending? |
| **RSI Context** | 30 | Momentum alignment — is RSI confirming direction? |
| **Volume Expansion** | 30 | Institutional participation — is volume above average? |
| **Total** | 100 | |

### Grade Thresholds

| Grade | Score | Action |
|-------|-------|--------|
| 🏆 **A+** | 80–100 | Auto-execute |
| ✅ **A** | 65–79 | Auto-execute |
| 🚫 **B** | 50–64 | Removed — 13% WR in live data |
| 🚫 **F** | 0–49 | Hard blocked |

### Live Results

```
Grade A  → 6 trades · 50% win rate · +$53.19 ✅
Grade B  → 15 trades · 13% win rate · -$122.16 ❌ (removed)
Decision → Only A+ and A grades execute
```

---

## 🕸️ LangGraph Agent Pipeline

Every signal passes through a stateful LangGraph agent before execution.

```
START
  ↓
[regime_node]   — Detect market regime (trending/ranging/choppy/volatile)
  ↓ volatile → REJECT
[trend_node]    — Check EMA direction and ADX threshold
  ↓ neutral  → REJECT
[risk_node]     — Calculate SL/TP from swing levels + ATR buffer
  ↓ invalid  → REJECT
[grade_node]    — Score ADX + RSI + Volume → assign grade
  ↓ grade F  → REJECT
[sizing_node]   — Calculate position size with dynamic risk
  ↓ skip     → REJECT
[finalize]      — Build signal dict and write to Redis
  ↓
EXECUTE
```

Every node decision is logged and traceable through LangSmith at smith.langchain.com.

---

## 🇮🇳 Indian Market — ORB Strategy

A completely separate strategy running alongside the crypto engine via AngelOne SmartAPI.

```
9:15 IST  — Market opens
9:15–9:30 — Opening Range forms (first 15-minute candle)
9:30      — ORB levels locked (High and Low)

Validation:
  ORB size between 200–350 points
  Pre-session range > 300 pts OR prev day range > 600 pts
  Not week 3 of month (expiry week — skipped)

11:00–12:00 IST — Entry window
  Price breaks below ORB Low → SHORT entry
  Entry buffer: 10 points below breakdown

Risk:
  SL = ORB size × 0.3 (above entry)
  TP = ORB size × 1.0 (below entry)
  Time exit at 2:30 PM IST regardless
```

---

## 🤖 RAG Intelligence Layer

A full Retrieval-Augmented Generation pipeline that gives the AI assistant access to actual trading history.

```
User asks: "Why do my signals fail on Fridays?"
                    │
                    ▼
         Embed question as vector
                    │
                    ▼
    Search ChromaDB across 5 collections
                    │
                    ▼
    Retrieve most relevant chunks
    (semantic search — not keyword matching)
                    │
                    ▼
    Send retrieved context to Groq LLM
                    │
                    ▼
    Answer grounded in actual trade data
    with source attribution
```

### 5 Chunk Types

| Chunk Type | Source | Good For |
|------------|--------|----------|
| Trade chunks | trades table | Loss analysis, pattern finding |
| Signal chunks | signals table | Signal quality questions |
| Daily summaries | trades grouped by day | Period performance |
| Coin performance | trades grouped by coin | Coin-specific analysis |
| Documentation | README + WORKING.md | Concept explanations |

---

## 🔭 LangSmith Observability

Every AI operation is traced through LangSmith.

```
Traces:
  LangGraph agent executions — every node, every rejection reason
  RAG queries — question, retrieved docs, similarity scores, LLM response
  LangChain calls — inputs, outputs, token usage, latency, errors
```

Dashboard: `https://smith.langchain.com`

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Python 3.11+ |
| API | FastAPI + Uvicorn |
| Cache | Redis 7 |
| Database | SQLite + SQLAlchemy |
| Exchange (Crypto) | Binance Futures via CCXT |
| Exchange (Indian) | AngelOne SmartAPI |
| Scheduling | APScheduler |
| Indicators | TA-Lib, Pandas, NumPy |
| ML | LightGBM + scikit-learn |
| RAG | LangChain + ChromaDB |
| Embeddings | sentence-transformers (local CPU) |
| Agents | LangGraph |
| Observability | LangSmith |
| Alerts | Telegram Bot API |
| LLM | Groq llama-3.3-70b |
| Auth | PyOTP + bcrypt + JWT + Google OAuth |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite + PWA |
| Styling | TailwindCSS |
| Animation | Framer Motion |
| Data | TanStack Query |
| State | Zustand |
| Charts | Recharts |
| Components | Radix UI |

### Infrastructure
| Layer | Technology |
|-------|-----------|
| Server | AWS EC2 t3.small |
| Containers | Docker + Compose |
| Proxy | Nginx + SSL |

---

## 🏢 SaaS Tier System

```
┌──────────┬──────────┬──────────┬──────────┐
│   FREE   │   PRO    │  ELITE   │  ADMIN   │
├──────────┼──────────┼──────────┼──────────┤
│ 30m delay│  Live    │  Live    │  Live    │
│ 3/day    │Unlimited │Unlimited │Unlimited │
│ Grade ✅ │ Grade ✅ │ Grade ✅ │ Grade ✅ │
│ Levels ❌│ Levels ✅│ Levels ✅│ Levels ✅│
│ ML ❌    │ ML ❌    │ ML ✅    │ ML ✅    │
│ Factors❌│Factors ❌│Factors ✅│Factors ✅│
│ RAG ❌   │ RAG ❌   │ RAG ✅   │ RAG ✅   │
│ API ❌   │ API ❌   │ API ✅   │ API ✅   │
│ 5 coins  │All coins │All coins │All coins │
└──────────┴──────────┴──────────┴──────────┘
```

---

## 🔒 Security

- **Google OAuth** — Secure user authentication
- **TOTP (2FA)** — Required for mode switching and dangerous actions
- **JWT Sessions** — Secure session management with device tracking
- **Rate Limiting** — All endpoints protected via slowapi
- **API Keys** — Programmatic access with prefix tracking
- **Audit Log** — Every action logged with IP and timestamp
- **Circuit Breakers** — Portfolio drawdown protection at 5 levels

---

## ⏱️ Scan Schedule

| Job | Schedule | Description |
|-----|----------|-------------|
| Crypto scan | `:00/:15/:30/:45 UTC` | Full 37-coin universe |
| RAG reindex | `Every 30 min` | Index new trades and signals |
| Morning briefing | `08:00 UTC` | London open summary |
| Evening briefing | `14:30 UTC` | NY open summary |
| Indian ORB setup | `04:05 UTC (9:35 IST)` | Lock opening range |
| Indian scan | `Every 5 min` | Check for ORB breakdown |
| Indian close | `09:45 UTC (3:15 IST)` | Force close + daily summary |

---

## 🚀 Built With AI-Augmented Development

This entire system — 50+ Python files, React frontend, RAG pipeline, LangGraph agents, Indian market integration, full SaaS infrastructure — was **architected and built through structured prompt engineering** using Claude AI as a coding assistant.

No traditional software engineering background.
Every architectural decision, trading strategy, and system design was made independently.
Claude was the tool. The thinking was mine.
100% production deployed and running live.

**What this demonstrates:**
- Designing and deploying production AI systems end to end
- Using LangChain, LangGraph, and LangSmith in a real working system
- Making data-driven decisions based on live trading results
- Building and iterating on ML pipelines with real feedback loops
- Full stack deployment on AWS with Docker and Nginx

---

## 📞 Contact

<div align="center">

**Vishal Katike**

[![Email](https://img.shields.io/badge/Email-vishalkool166@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:vishalkool166@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-+91_8978439995-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](tel:+918978439995)
[![Live System](https://img.shields.io/badge/🔴_Live_System-signal--engine--v5.vishalkool.top-00ff88?style=for-the-badge)](https://signal-engine-v5.vishalkool.top)

*Open to: AI Engineer · LangChain Developer · Agentic AI Engineer · Prompt Engineer*

</div>

---

<div align="center">

*Built with Python · FastAPI · Redis · LightGBM · LangChain · LangGraph · LangSmith · ChromaDB · React · TypeScript*

⭐ Star this repo if you found it interesting!

</div>