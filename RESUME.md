# VISHAL KATIKE
**AI Engineer · LangChain · LangGraph · LangSmith · RAG · LLM Systems**

Hyderabad, India · vishalkool166@gmail.com · +91 8978439995
[Signal Engine v5](https://signal-engine-v5.vishalkool.top) · [GitHub](https://github.com/vishalkool166/signal-engine-portfolio) · [LinkedIn](https://linkedin.com/in/vishal-katike)

---

## Summary

AI Engineer with 4 years at Amazon who independently designed, built, and deployed **Signal Engine v5** — a production AI trading platform running 24/7 on AWS. The system combines a LangGraph stateful agent pipeline, RAG intelligence layer using LangChain and ChromaDB, LangSmith observability, and LightGBM ML gate across two markets — Binance Futures and Indian equity (BANKNIFTY/FINNIFTY via AngelOne). Built entirely through structured prompt engineering using Claude AI as a coding assistant. Every architectural decision, trading strategy, and system design was made independently.

Currently contributing to AI model training and large-scale data analysis at Amazon, with hands-on experience structuring datasets for LLM pipelines and building QuickSight dashboards that drove $2.6M in annual cost reduction.

---

## Core Skills

**AI Engineering**
LangChain · LangGraph · LangSmith · RAG Pipelines · ChromaDB · Vector Stores · Semantic Search · Prompt Engineering · Groq API · Llama 3.3-70b · LLM Orchestration · sentence-transformers · Agentic AI Systems

**Machine Learning**
LightGBM · scikit-learn · Feature Engineering · Model Training · Win Probability Prediction · Walk-Forward Backtesting

**Backend**
Python · FastAPI · Redis · SQLite · SQLAlchemy · Docker · AWS EC2 · Nginx · WebSockets · REST APIs · APScheduler

**Frontend**
React 18 · TypeScript · TailwindCSS · Framer Motion · Vite · PWA · TanStack Query · Zustand · Recharts

**Data**
SQL · Amazon QuickSight · Pandas · NumPy · Root Cause Analysis · Large-scale Dataset Structuring

**Security and Auth**
Google OAuth · JWT Sessions · TOTP 2FA · Rate Limiting · Audit Logging · Multi-tier SaaS

---

## Featured Project

### [Signal Engine v5](https://signal-engine-v5.vishalkool.top) — Production AI Trading Intelligence Platform
*Python · FastAPI · LangChain · LangGraph · LangSmith · ChromaDB · sentence-transformers · LightGBM · React · TypeScript · Redis · Docker · AWS EC2 · AngelOne API*

**What it is:**
A fully autonomous trading intelligence platform running 24/7 on AWS EC2 t3.small. Covers two markets — Binance Futures (37 coins, every 15 minutes) and Indian equity futures (BANKNIFTY/FINNIFTY via AngelOne). Every component from signal detection to execution to observability was built and deployed independently.

**LangGraph Agent Pipeline**
- Converted signal analysis into a stateful LangGraph agent graph with nodes for regime detection, trend direction, risk calculation, confluence scoring, position sizing, and finalization
- Every node decision is logged and traceable — rejection reasons visible per coin per scan
- Observable end-to-end through LangSmith at smith.langchain.com

**RAG Intelligence Layer**
- Built a production RAG pipeline using LangChain and ChromaDB — 5 collection types covering trades, signals, daily summaries, coin performance, and documentation
- Local CPU embeddings using sentence-transformers — zero cost, data stays on server
- Semantic search across full trade history — answers grounded in actual trading data with source attribution
- Re-indexed every 30 minutes via APScheduler

**LangSmith Observability**
- Integrated LangSmith tracing across all LangChain and LangGraph operations
- Every RAG query, agent execution, and LLM call observable with latency, token usage, and errors

**Signal Scoring and Iteration**
- Built and deployed ADX + RSI + Volume confluence scoring engine
- Ran live on Binance Futures — identified through real trade data that Grade B signals had 13% win rate vs Grade A at 50% win rate
- Made data-driven decision to remove B grades — demonstrates real feedback loop between system and live results

**LightGBM ML Gate**
- Designed feature engineering pipeline from live trade data
- LightGBM classifier trained on closed trades to predict win probability
- Auto-retrains when 25 new trades accumulate — fully automated pipeline

**Indian Market ORB Strategy**
- Built a completely separate Opening Range Breakout strategy for BANKNIFTY and FINNIFTY
- AngelOne SmartAPI integration for live data and session management
- Validates ORB size (200–350 pts), pre-session volatility, and week-of-month filter before entry
- SHORT entries on breakdown below ORB Low between 11am–12pm IST
- Telegram alerts on signal, outcome, and daily summary with rupee PnL per lot

**Infrastructure and SaaS**
- Full stack deployed on AWS EC2 with Docker Compose, Nginx, SSL, and auto-deploy pipeline
- Multi-tier SaaS (Free/Pro/Elite/Admin) with Google OAuth, JWT sessions, TOTP 2FA, and API key access
- Telegram bot with 30+ commands for remote monitoring and control
- WebSocket push to dashboard every 2 seconds
- Portfolio circuit breakers at 5 drawdown levels

---

## Experience

### Amazon — Hyderabad

**Catalog Specialist and AI Data Analyst** · May 2025 – Present
- Analyzed 300+ ASINs daily and performed root cause analysis on 500,000+ return records identifying key defect patterns
- Structured large-scale datasets for AI model training contributing to improved content moderation accuracy
- Built QuickSight dashboards contributing to $2.6M annual cost reduction
- Collaborated with cross-functional teams to deliver data-driven insights at scale

**KDP Senior Analyst** · February 2023 – May 2025
- Moderated 8,000+ KDP submissions for AI-generated content violations and copyright infringement
- Contributed labeled data and pattern analysis to an LLM-based fraud detection pipeline
- Led a 4-person team clearing a major compliance backlog within 4 weeks
- Developed internal documentation and training material for new analysts

**Senior Seller Support Associate** · March 2022 – September 2022
- Resolved complex seller escalations with 95%+ first-contact resolution rate
- Handled high-priority cases requiring cross-team coordination and policy interpretation

---

### Keolis Hyderabad MRTS — Train Operator · December 2018 – November 2021
- Operated metro rail services maintaining strict compliance with safety SOPs
- Trained and supervised new recruits on operational procedures and safety protocols

---

## Education

**B.Tech — Mechanical Engineering**
Vidya Jyoti Institute of Technology · 2014 – 2018

---

## How I Build

Signal Engine v5 was built file by file using Claude AI as a coding assistant. I do not come from a traditional software engineering background. Every architectural decision — the LangGraph node design, the RAG chunking strategy, the ORB entry logic, the SaaS tier system, the Binance execution pipeline — was made by me. Claude was the tool. The thinking, the strategy, and the iteration based on live results were entirely mine.

This is how I believe AI engineers should work in 2025 — using AI as a force multiplier to build systems that would otherwise require a team.

---

## Open To

AI Engineer · RAG Engineer · LangChain Developer · Agentic AI Engineer · AI Product Engineer · Prompt Engineer