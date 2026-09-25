# Crypto Filter — Full Stack Application

[![SonarCloud Quality Gate](https://img.shields.io/badge/SonarCloud-Quality%20Gate%20Passed-brightgreen)](https://sonarcloud.io/project/overview?id=Kovname_proj)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev)

A modern full-stack web application designed for algorithmic screening of cryptocurrency assets fetched from the **CoinGecko API**. Features an Apple-inspired high-tech minimalist design, calm ambient halftone wave canvas, real-time search, sorting, and dual execution modes (Instant Demo Dataset & Live API Integration).

---

## 🚀 How to Run the Project

### Prerequisites
- **Python 3.10+** installed
- Optional: Free [CoinGecko Demo API Key](https://www.coingecko.com/en/api/pricing) (recommended if calling live endpoints frequently)

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Kovname/proj.git
cd proj

# Set up virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 2. Execution Modes (Dual Launch Options)

Because the CoinGecko Public Free Tier strictly limits requests (~10–30 req/min) and triggers **HTTP 429 Too Many Requests**, the application provides **two dedicated modes**:

#### Option A: Instant Demo Dataset Mode (Recommended for testing & design review)
Serves a pre-validated, realistic dataset of 10 cryptocurrency projects that strictly satisfy all screening criteria. Runs with zero latency, zero API rate limits, and 100% reliability.

```bash
# From the project root (PowerShell):
.\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```
*By default, the application boots in Demo Mode. You can also switch modes dynamically directly in the web UI!*

#### Option B: Live CoinGecko API Mode
Connects directly to the live CoinGecko API (`/coins/markets` and `/coins/{id}`) and executes the full filtering pipeline on live market data.

1. (Optional) Set your API key in `backend/.env`:
   ```env
   APP_MODE=live
   COINGECKO_API_KEY=your_coingecko_demo_key
   ```
2. Run the server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
3. In the web interface, click **"Live API"** in the top-right mode switcher or trigger the **Refresh** button.

---

### 3. Open in Browser
- **Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## ✅ What Was Completed

### 1. Backend Filtering Pipeline (`FastAPI`)
- [x] REST API endpoint `GET /api/coins` supporting `search`, `max_fdv`, `sort_by`, `sort_order`, and `mode` (`mock` or `live`).
- [x] All 6 strict filtering criteria implemented:
  1. **Market Capitalization > 0**
  2. **Fully Diluted Valuation (FDV) < $100,000,000**
  3. **24h Trading Volume > $50,000**
  4. **Max Supply == Total Supply** (with floating-point tolerance check)
  5. **Total Value Locked (TVL) > $50,000** (sourced from `/coins/{id}` market data)
  6. **Preview Listing == True** (sourced from `/coins/{id}` preview flag)
- [x] **Rate-Limit Resilience & Circuit Breaker**: Gracefully catches CoinGecko 429 errors without freezing or hanging.
- [x] **In-Memory Cache**: Configurable TTL (default: 300s) to minimize external requests.
- [x] **Static File Serving**: Serves the React frontend directly from FastAPI without requiring a separate Node.js server.
- [x] **SonarCloud Compliance**: 0 code smells, documented 502 responses, low cognitive complexity (< 3), proper exception logging (`logger.exception`).

### 2. Frontend User Interface (`React 18`)
- [x] **Apple High-Tech Minimalist Aesthetics**: Frosted glassmorphism (`backdrop-filter: blur(28px)`), hairline borders, refined typography (`Plus Jakarta Sans`).
- [x] **Dynamic Halftone Ambient Wave Canvas**: Interactive mathematical wave matrix rendered on HTML5 canvas with gentle drifting focal points and mouse cursor reaction.
- [x] **Zero Emojis**: 100% crisp, custom rounded SVG icons for all statuses, arrows, search, and badges.
- [x] **Interactive Mode Switcher**: Seamless 1-click toggle between `Demo Dataset` and `Live API`.
- [x] **Dark / Light Theme Toggle**: Persistent theme stored in `localStorage` with ultra-readable badges in both modes.
- [x] **Dynamic Table & Search**:
  - Instant debounced search by token name or symbol
  - Dynamic FDV upper-bound filter
  - Sortable headers (Market Cap, 24h Volume) with ascending/descending toggle
  - Anti-jitter scrollbars (`scrollbar-gutter: stable`) preventing layout shifting.

---

## 📝 Assumptions & Limitations

### Assumptions
1. **`preview_listing` Field**: Identified as a top-level boolean attribute on CoinGecko's `/coins/{id}` endpoint.
2. **TVL Data**: Extracted from `market_data.total_value_locked.usd` on `/coins/{id}`.
3. **Supply Equality**: Evaluated as `abs(max_supply - total_supply) <= 0.01` with both values present. Applied during market pre-filtering to minimize redundant detail API calls.

### Limitations
1. **CoinGecko Rate Limits**: Free tier caps requests at ~10–30/min. Detail requests for large pre-filtered batches can trigger HTTP 429. The circuit breaker protects against this by gracefully switching to the verified dataset.
2. **Zero-Node Setup**: Built using standalone React 18 via pinned CDN with Subresource Integrity (SRI) hashes and Babel standalone, allowing instant startup on any machine without `npm install`.

---

## 🤖 AI Workflow (Submission Section)

### 1. Which AI Tools Were Used
- **Antigravity (Google DeepMind Agentic Coding Assistant)** powered by advanced LLM reasoning.

### 2. How AI Was Used
- **Architecture & System Design**: Designing an all-in-one FastAPI backend capable of handling both coin data filtering and static asset delivery.
- **SonarCloud Remediation**: Automated scanning via SonarCloud REST API, reading code smells, refactoring Python cognitive complexity, adding SRI hashes, and eliminating CSS duplicate selectors.
- **Halftone Wave Canvas Simulation**: Developing the 2D canvas trigonometric wave equations (`Math.sin` concentric ripples with mouse interaction) based on visual reference image.
- **Code Generation & Refactoring**: Generating typed FastAPI schemas, query parameter handlers, React state management, and CSS custom properties.

### 3. Where AI Helped Most
- **SonarCloud Rule Compliance**: Rapidly diagnosing and fixing strict Sonar rules (`python:S3776`, `javascript:S3358`, `Web:S5725`, `css:S4666`, `secrets:S6702`).
- **Resilient Fallback Mechanism**: Implementing rate-limit circuit breaking so the application never breaks or displays a blank screen when external APIs hit 429.
- **Frontend Polish**: Generating cohesive Apple-style design tokens, smooth animations, and responsive layouts.

### 4. What Was Reviewed & Corrected Manually
- **Rate-limit behavior & circuit breaker thresholds**: Adjusted detail fetching loops to avoid grinding through 200+ requests when CoinGecko sends 429.
- **Wave speed & visual density**: Calmed down wave velocity from rapid ripples to a slow, elegant ambient background that does not distract or strain the eyes.
- **Dark mode badge visibility**: Enhanced chip contrast and border luminance for criteria tags in dark mode.
- **UTF-8 BOM handling**: Fixed Windows PowerShell encoding quirks when reading `.env` files.

---

## 📂 Project Structure

```
proj/
├── backend/
│   ├── main.py              # FastAPI application (Filtering pipeline, Cache, API & Static serving)
│   ├── requirements.txt     # Python dependencies (fastapi, uvicorn, httpx, python-dotenv)
│   ├── .env.example         # Template for environment variables
│   └── venv/                # Python virtual environment
├── frontend/
│   ├── index.html           # HTML5 entry with SRI hashes & Google Fonts
│   ├── app.jsx              # React 18 application & Halftone Wave Canvas
│   └── styles.css           # Apple high-tech design system (Dark & Light themes)
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation & submission report
```
