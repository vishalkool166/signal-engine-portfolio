# Signal Engine v5
### AI-Powered Crypto Futures Trading Intelligence System

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://signal-engine-v5.vishalkool.top)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Deployed-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazonaws)](https://aws.amazon.com)

> Built entirely through **structured prompt engineering** over 2 months.
> Zero traditional coding background. 100% production deployed.

---

## 🔴 Live System

**Dashboard:** https://signal-engine-v5.vishalkool.top

The system is running 24/7 on AWS EC2, scanning 15+ crypto coins
every 15 minutes and generating real trading signals.

---

## What Is This?

Signal Engine v5 is a fully autonomous crypto futures trading
intelligence platform that:

- **Scans** 15+ coins every 15 minutes across 4 timeframes
- **Scores** each coin using 16 weighted confluence factors
- **Grades** signals A+/A/B/C/F based on score out of 100
- **Executes** trades on Binance Futures automatically
- **Learns** from closed trades using LightGBM ML model
- **Generates** AI-written Twitter content via Groq LLM
- **Alerts** via Telegram bot with 30+ commands
- **Displays** everything on real-time React dashboard

---

## Architecture

```
Binance API (Market Data)
        ↓
Signal Engine (Python/FastAPI)
        ↓
16-Factor Confluence Scorer
        ↓
Grade: A+ / A / B / C / F
        ↓
LightGBM ML Gate (65% threshold)
        ↓
Trade Execution (Binance Futures)
        ↓
WebSocket Push → React Dashboard
        ↓
Telegram Alerts + Twitter Content
```

---

## Signal Grading System

| Grade | Score | Action |
|-------|-------|--------|
| A+ | 85-100 | Auto execute — highest confidence |
| A | 68-84 | Auto execute — high confidence |
| B | 52-67 | Paper mode only — data collection |
| C | 38-51 | Watch only — setup building |
| F | 0-37 | Hard blocked — no trade |

---

## 16 Confluence Factors

| Factor | Weight | What It Checks |
|--------|--------|----------------|
| Liquidity Sweep | 12 | Stop hunt at key level |
| Retest Confirmation | 12 | Price returned to zone |
| Displacement | 11 | Impulsive institutional move |
| Market Regime | 10 | Trending/ranging/choppy |
| Weekly Filter | 10 | Weekly + daily alignment |
| Market Structure | 9 | BOS/CHoCH bias |
| Session Timing | 8 | London/NY quality |
| BTC Alignment | 8 | BTC trend confirmation |
| OI Behavior | 7 | Open interest direction |
| Volume Expansion | 7 | Volume above average |
| Funding Rate | 6 | Squeeze risk filter |
| RSI Divergence | 4 | Hidden/regular divergence |
| Order Blocks | 4 | ICT OB zone proximity |
| ATR Volatility | 3 | Tradeable range check |
| RSI Context | 2 | Not overbought/oversold |
| MACD Histogram | 1 | Momentum confirmation |

---

## ML Gate

After 100 closed trades, LightGBM classifier activates:

- Trains on all 16 factor scores + regime + session + direction
- Predicts win probability for every new signal
- Signals below **65% probability** are filtered out
- Auto-retrains every 50 new trades
- Gets smarter over time

---

## Tech Stack

### Backend
- **Python 3.11** — Core language
- **FastAPI** — REST API + WebSocket server
- **Redis** — Real-time data layer
- **SQLite** — Signal and trade storage
- **LightGBM** — ML signal filtering
- **APScheduler** — 15-minute scan jobs
- **CCXT** — Binance Futures integration

### Frontend
- **React 18** + **TypeScript** — UI framework
- **Vite** — Build tool
- **TailwindCSS** — Styling
- **Framer Motion** — Animations
- **TanStack Query** — Data fetching
- **Recharts** — Charts and graphs
- **Zustand** — State management
- **Radix UI** — Component library

### Infrastructure
- **AWS EC2** — t3.small server
- **Docker + Docker Compose** — Containerization
- **Nginx** — Reverse proxy + SSL
- **Let's Encrypt** — SSL certificate

### Integrations
- **Binance Futures API** — Market data + trade execution
- **Telegram Bot API** — 30+ command alerts
- **Groq LLM** (llama-3.3-70b) — AI content generation
- **Twitter/X API** — Auto post signals
- **Google OAuth** — Authentication

---

## SaaS Tier System

| Feature | Free | Pro | Elite | Admin |
|---------|------|-----|-------|-------|
| Signal delay | 30 min | Live | Live | Live |
| Entry/SL/TP levels | ❌ | ✅ | ✅ | ✅ |
| ML probability | ❌ | ❌ | ✅ | ✅ |
| Confluence factors | ❌ | ❌ | ✅ | ✅ |
| API key access | ❌ | ❌ | ✅ | ✅ |
| Backtest access | ❌ | ❌ | ✅ | ✅ |

---

## Key Features

### Real-Time Dashboard
- WebSocket push updates every 2 seconds
- Live signal radar with all coins
- Open positions with live PnL
- Equity curve and performance charts
- Mobile responsive PWA

### Telegram Bot (30+ Commands)
```
/scan     — Trigger manual scan
/queue    — Best signals right now
/trades   — Open positions with PnL
/ml       — ML model status
/btc      — BTC analysis
/stats    — All time statistics
/mode     — Switch paper/live (TOTP secured)
```

### Content Pipeline
- Auto-generates Twitter posts for every A+/A signal
- Groq LLM writes professional/educational/humor posts
- Telegram approval before posting
- Engagement tracking

### Security
- Google OAuth authentication
- TOTP (2FA) for mode switching and dangerous actions
- Session management with device tracking
- API key system for programmatic access
- Rate limiting on all endpoints

---

## Project Structure

```
signal-engine-portfolio/
├── backend/
│   ├── main.py              # FastAPI app + WebSocket
│   ├── config.py            # Configuration + SaaS tiers
│   ├── database.py          # SQLAlchemy models
│   ├── scheduler.py         # APScheduler jobs
│   ├── auth.py              # JWT + TOTP + OAuth
│   ├── engines/
│   │   ├── indicators.py    # Technical indicators
│   │   ├── capital.py       # Position sizing
│   │   ├── validator.py     # Data validation
│   │   └── PROPRIETARY.md  # Core engine (on request)
│   ├── ml/
│   │   └── PROPRIETARY.md  # ML pipeline (on request)
│   ├── alerts/
│   │   ├── telegram.py      # Telegram bot
│   │   └── PROPRIETARY.md  # Scanner (on request)
│   ├── trade/
│   │   ├── exchange.py      # Binance integration
│   │   ├── monitor.py       # Position monitoring
│   │   └── executor.py      # Order execution
│   └── data/
│       ├── fetcher.py       # Market data
│       └── store.py         # Candle storage
└── frontend/
    └── src/
        ├── pages/           # 11 dashboard pages
        ├── components/      # Reusable UI components
        ├── stores/          # Zustand state
        └── types/           # TypeScript definitions
```

---

## Proprietary Components

The following components contain the core trading intelligence
and are available for review during technical interviews:

- `engines/confluence.py` — 16-factor scoring engine
- `engines/signal.py` — Signal generation + grading
- `engines/sweep.py` — Liquidity sweep detection
- `engines/displacement.py` — Displacement detection
- `engines/retest.py` — Retest zone confirmation
- `ml/trainer.py` — LightGBM training pipeline
- `ml/predictor.py` — Win probability prediction
- `alerts/scanner.py` — Core scan orchestration

**Contact for full code review:** vishalkool166@gmail.com

---

## Built With Prompt Engineering

This entire system was architected and built through
**structured prompt engineering** over 2 months:

- 50+ production Python files
- 70+ React/TypeScript components
- Full infrastructure setup
- Live deployment on AWS

This demonstrates the core skill of modern AI-augmented
development — knowing WHAT to build, HOW to structure it,
and directing AI to implement it correctly.

---

## Contact

**Vishal Katike**
vishalkool166@gmail.com
+91 8978439995
Hyderabad, India

[Resume](https://github.com/vishalkool166/signal-engine-portfolio/blob/main/RESUME.md) |
[Live Demo](https://signal-engine-v5.vishalkool.top) |
[LinkedIn](https://www.linkedin.com/in/vishal-katike)