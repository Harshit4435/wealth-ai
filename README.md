# Wealth AI — Autonomous Personal Financial Intelligence & Copilot

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15_TypeScript-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn_1.9+-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Python](https://img.shields.io/badge/Python-3.12%20|%203.14-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)

**An autonomous personal financial intelligence platform that categorizes transactions with machine learning, detects spending anomalies, forecasts month-end burn rates, continuously profiles a 5-pillar Financial Health Score, and delivers deterministic AI Copilot financial reasoning.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [ML Pipelines](#-machine-learning-architecture) • [Copilot Reasoning](#-ai-financial-copilot) • [Health Engine](#-5-pillar-financial-health-engine) • [Quickstart](#-quickstart) • [Roadmap](#-12-week-implementation-roadmap)

</div>

---

## 🌟 Key Features

### 1. Multi-Modal Transaction Capture (Layer 1)
- **Natural Language Parsing**: Translates human speech/text like `"Spent 450 on dinner with friends"` or `"Swiggy 438"` into structured records with automated merchant, amount, category, and date extraction.
- **CSV & Statement Parsing**: Automated ingestion of bank statements and card exports.
- **Receipt & Invoice OCR Ready**: Normalizes vendor details and items.

### 2. Continuous ML Categorizer (Layer 2)
- **TF-IDF + Linear Classification**: High-accuracy category and subcategory prediction with continuous probability distribution (`Food: 92%`, `Shopping: 4%`).
- **Active Feedback Training Loop**: User category corrections (`"Wrong Category"`) feed directly into an online feedback store that dynamically updates classifier weights.

### 3. Financial Intelligence & Spending Velocity (Layer 3)
- **Spending Velocity Forecast**: Evaluates run-rates against historical 3-month baselines. Detects category surges (e.g. *"Food spending is currently ~40% above baseline. Projected October Food: ₹9,300"*).
- **Anomaly & Outlier Detector**: Flags unusual spikes or accidental double charges using statistical IQR / z-score deviation without alarmist phrasing.

### 4. Transparent 5-Pillar Financial Health Engine (Layer 4)
No opaque black boxes. Continuously monitors five explainable pillars:
- **Cash Flow** (Income vs. operational burn)
- **Savings Rate** (Trajectory vs. monthly target)
- **Spending Discipline** (Category limits & discretionary burn)
- **Debt & Fixed Commitments** (Fixed obligations ratio)
- **Consistency** (Day-to-day variance & surprise spikes)

### 5. AI Financial Copilot (Layer 5)
- **Deterministic Math + LLM Reasoning**: LLMs reason and explain; deterministic financial calculators crunch the real numbers.
- **Affordability Simulations**: Answers questions like *"Can I afford a ₹20,000 phone this month?"* by inspecting liquid cash, upcoming fixed bills before payday, and projecting exact cash buffers (now vs. waiting for salary).
- **Proactive Notification Engine**: Daily autonomous evaluations alerting users to spending surges, unused subscriptions, and savings milestones.

---

## 🏛 System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            NEXT.JS 15 WEB CLIENT             │
                    │   (App Router, TypeScript, Glassmorphism)    │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP / JSON
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               FASTAPI GATEWAY                │
                    │            (Validation & Routing)            │
                    └──────┬───────────────┬────────────────┬──────┘
                           │               │                │
            ┌──────────────▼────┐   ┌──────▼──────┐   ┌─────▼──────────┐
            │ Transactions API  │   │ Copilot API │   │ Analytics API  │
            └──────────────┬────┘   └──────┬──────┘   └─────┬──────────┘
                           │               │                │
                           ▼               ▼                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE & ML LAYER                         │
│                                                                        │
│   ┌────────────────────┐   ┌───────────────────┐   ┌───────────────┐   │
│   │   ML Categorizer   │   │ Spending Forecast │   │ Health Engine │   │
│   │   (TF-IDF + LogReg)│   │  (Run-rate / ETS) │   │  (5 Pillars)  │   │
│   └─────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘   │
│             │                        │                     │           │
│   ┌─────────▼──────────┐   ┌─────────▼─────────┐   ┌───────▼───────┐   │
│   │ Feedback Loop Store│   │ Anomaly Detector  │   │ Copilot Tools │   │
│   └────────────────────┘   └───────────────────┘   └───────────────┘   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       PERSISTENCE DATA       │
                    │ (PostgreSQL / SQLite Storage)│
                    └──────────────────────────────┘
```

---

## 🧠 Machine Learning Architecture

```
                       USER TRANSACTION
                              │
                              ▼
                    ┌──────────────────┐
                    │ Text Processing  │
                    │  & Normalization │
                    └─────────┬────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    Merchant & Text      Amount & Type        Timestamp &
       Features             Features         Recurrence
          │                   │                   │
          ▼                   ▼                   ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │ TF-IDF ML    │    │ Outlier      │    │ Time-Series  │
   │ Categorizer  │    │ Anomaly Model│    │ Run-Rate     │
   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                   Financial Intelligence
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
        Continuous Feedback         AI Copilot Tools
        (User Corrections)         (Affordability & Goals)
```

---

## 💬 AI Financial Copilot

Rather than treating the LLM as a calculator (which causes hallucinations with finances), **Wealth AI** strictly separates **intent recognition & reasoning** from **mathematical computation**:

```
User Query: "Can I afford a ₹20,000 phone this month?"
      │
      ▼
Intent Detection & Extraction:
  • Intent: affordability_assessment
  • Amount: ₹20,000
  • Category: Electronics / Shopping
      │
      ▼
Deterministic Tool Executions:
  • Liquid Balance Tool: ₹31,500
  • Upcoming Obligations Tool (12 days to payday): ₹14,000
  • Buffer Before Purchase: ₹17,500
  • Impact Simulation: ₹17,500 - ₹20,000 = -₹2,500 (Deficit Risk)
  • Post-Salary Runway Tool: ₹17,500 buffer if purchased on payday
      │
      ▼
Synthesized Financial Advisory:
  "You currently have ₹31,500 available, but you have approximately
   ₹14,000 of expected expenses before your next salary. A ₹20,000 purchase
   would reduce your projected buffer to about -₹2,500.
   If you wait until your next salary (12 days), your projected buffer
   would be approximately ₹17,500."
```

---

## 📊 5-Pillar Financial Health Engine

```
                    Financial Health Profile

Cash Flow       ████████░░  81 / 100
Savings         ██████░░░░  63 / 100
Spending        ███████░░░  72 / 100
Debt            ████████░░  84 / 100
Consistency     █████░░░░░░  51 / 100

Composite Score: 70 / 100 (Strong • Discretionary Velocity Elevated)

Core Operational Indicators
─────────────────────────────────────────────
Monthly Income:         ₹65,000
Monthly Spending:       ₹43,200
Expected Savings:       ₹21,800
Next Salary:            12 days
Expected Buffer:        ₹8,900
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (or Python 3.14)

### 1. Clone & Setup Repository
```bash
git clone https://github.com/Harshit4435/wealth-ai.git
cd wealth-ai
```

### 2. Start the FastAPI Backend
```bash
# Setup virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the server
cd backend
python3 main.py
# Backend runs at http://localhost:8000
# Interactive Swagger Docs at http://localhost:8000/docs
```

### 3. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

---

## 📈 Production Metrics & Analytics

To ensure measurable real-world product usage and continuous ML improvement, the system tracks:

| Metric Category | Key Indicators | Target Threshold |
| :--- | :--- | :--- |
| **Product** | DAU, WAU, D1/D7/D30 Retention, Session Duration | >40% D7 Retention |
| **Engagement**| Transactions added, NL parser usage, Copilot queries | >3 sessions/week |
| **ML Performance** | Top-1 Category Accuracy, Confidence Margin, User Correction Rate | >92% Category Precision |
| **Intelligence** | Forecast MAE, Spending Velocity Accuracy, Anomaly Precision | <8% Forecast Variance |

---

## 🗺 12-Week Implementation Roadmap

- [x] **Phase 0 — Product Definition & Architecture**
- [x] **Phase 1 — Core Foundation & Transaction Capture** (NL parser, manual entry, CSV upload)
- [x] **Phase 2 — ML Categorization & Continuous Feedback Loop**
- [x] **Phase 3 — Forecasting & Velocity Projections**
- [x] **Phase 4 — AI Financial Copilot with Deterministic Calculators**
- [x] **Phase 5 — Proactive Notification Engine & Health Profiling**
- [ ] **Phase 6 — Mobile App (React Native / Expo) & Bank Open-Finance Integrations**

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
