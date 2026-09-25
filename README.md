# Crypto Filter — Full Stack Application

## 📋 Overview

A full-stack application that fetches and displays filtered cryptocurrency project data from the **CoinGecko API**.

- **Backend**: Python / FastAPI — REST API with filtering, caching, and static file serving
- **Frontend**: React 18 — Interactive table with search, filters, and sorting

---

## 🚀 How to Run

### Prerequisites

- **Python 3.10+** installed
- Internet connection (to call CoinGecko API)

### 1. Clone & Navigate

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. (Optional) Configure API Key

Copy the example env file and add your CoinGecko Demo API key:

```bash
cp .env.example .env
# Edit .env and replace 'your_api_key_here' with your key
```

> You can get a **free** API key at https://www.coingecko.com/en/api/pricing

### 4. Run the Application

```bash
# From the /backend directory:
uvicorn main:app --reload --port 8000
```

### 5. Open in Browser

Navigate to: **http://localhost:8000**

The backend serves both the API (`/api/coins`) and the frontend UI from a single server.

---

## ✅ What Was Completed

### Backend (Part 1)
- [x] REST API endpoint (`GET /api/coins`) that returns filtered cryptocurrency data
- [x] Integration with CoinGecko API (`/coins/markets` + `/coins/{id}`)
- [x] All required filters implemented:
  - Market Cap > 0
  - FDV < $100M
  - 24h Trading Volume > $50K
  - Max Supply == Total Supply
  - TVL > $50K (fetched from coin detail endpoint)
  - preview_listing == true (fetched from coin detail endpoint)
- [x] In-memory caching with configurable TTL (default: 5 min)
- [x] Rate-limit-friendly sequential fetching
- [x] CORS support for development
- [x] Health check endpoint (`GET /`)
- [x] Cache refresh endpoint (`GET /api/coins/refresh`)
- [x] Clean project structure

### Frontend (Part 2)
- [x] Displays filtered cryptocurrency projects in a responsive table
- [x] **FDV filter**: user-defined maximum FDV value
- [x] **Search by name**: partial match, case-insensitive (also matches symbol)
- [x] **Sorting**: by Market Cap and 24h Volume (ascending/descending)
- [x] Loading, empty, and error states
- [x] Debounced API calls (400ms)
- [x] Premium dark theme with glassmorphism, gradients, and animations
- [x] Responsive design
- [x] Frontend only communicates with the backend (no direct external API calls)

---

## 🏗️ Architecture

```
┌────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│                │       │                  │       │                  │
│    Browser     │──────▶│   FastAPI         │──────▶│  CoinGecko API   │
│  (React SPA)   │◀──────│   Backend         │◀──────│  (External)      │
│                │       │                  │       │                  │
└────────────────┘       └──────────────────┘       └──────────────────┘
     /api/coins          Filters & Caches          /coins/markets
                                                   /coins/{id}
```

**Request flow:**
1. Frontend sends `GET /api/coins?search=...&max_fdv=...&sort_by=...`
2. Backend checks in-memory cache
3. If cache miss: fetches from CoinGecko, applies server-side filters, caches result
4. Additional client-driven filters (search, max_fdv, sort) are applied on top
5. Filtered results returned to frontend

---

## 📝 Assumptions & Limitations

### Assumptions

1. **`preview_listing` field**: This is a boolean field available on the CoinGecko `/coins/{id}` endpoint. It indicates whether a coin is in "preview" listing status on CoinGecko. Since it's not available on the bulk `/coins/markets` endpoint, each pre-filtered coin requires an individual API call.

2. **TVL data**: Total Value Locked is only available via the `/coins/{id}` detail endpoint in the `market_data.total_value_locked` object. Same as above — requires individual calls.

3. **"Max Supply equals Total Supply"**: Interpreted as both values being non-null and numerically equal (with float tolerance of 0.01).

4. **Supply equality filter**: Applied before the detail-fetch step to minimize API calls.

### Limitations

1. **CoinGecko Free API rate limits**: The free tier allows ~10-30 requests/minute. First load may take several minutes as we need to:
   - Fetch multiple pages of `/coins/markets` (up to 20 pages)
   - Fetch individual `/coins/{id}` for each pre-filtered coin
   
2. **Data freshness**: Results are cached for 5 minutes (configurable). Use the refresh button or `GET /api/coins/refresh` to force update.

3. **No Node.js dependency**: Frontend uses React via CDN + Babel standalone for JSX compilation. This was a deliberate choice for zero-dependency setup. For production, a Vite/webpack build would be preferred.

4. **In-memory cache**: Cache is lost on server restart. For production, Redis or similar would be used.

5. **Pagination not implemented on frontend**: All results are shown in a single table. For very large datasets, virtual scrolling or pagination would be added.

### What I Would Do Next (given more time)

- Add Redis caching for persistence across restarts
- Implement background task (Celery/APScheduler) to pre-fetch data periodically
- Add pagination and virtual scrolling for large result sets
- Add unit tests (pytest) and integration tests
- Move frontend to a proper Vite + React build with TypeScript
- Add Docker Compose for one-command setup
- Add rate limiter middleware on the API
- Implement WebSocket for real-time price updates
- Add more detailed coin cards (click-to-expand with charts)

---

## 🤖 AI Workflow

### Tools Used
- **Antigravity (Gemini-powered AI coding assistant)** — Used as the primary coding assistant for the entire project

### How AI Was Used
1. **Architecture planning**: Discussed CoinGecko API constraints, chose FastAPI + React CDN approach based on available tools (no Node.js installed)
2. **Code generation**: Generated the backend filtering pipeline, API endpoint, and the full React frontend
3. **API research**: Reviewed CoinGecko API documentation to understand available fields and endpoints
4. **Design implementation**: Generated premium dark-theme CSS with modern design patterns

### What Was Reviewed & Corrected Manually
- API endpoint field mapping verification
- Filter logic correctness (especially supply equality with float tolerance)
- Error handling and edge cases
- CORS and static file serving configuration

---

## 📂 Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application (API + static serving)
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment config template
│   └── .env                 # Your local config (gitignored)
├── frontend/
│   ├── index.html           # Entry HTML
│   ├── app.jsx              # React application (JSX)
│   └── styles.css           # Premium dark-theme styles
└── README.md                # This file
```

---

## 🛠️ Tech Stack

| Layer    | Technology       | Why                                           |
|----------|------------------|-----------------------------------------------|
| Backend  | FastAPI          | Modern, async, auto-docs, type-safe           |
| HTTP     | httpx            | Async HTTP client for CoinGecko API calls     |
| Frontend | React 18 (CDN)   | No build step needed, fast setup              |
| Styling  | Vanilla CSS      | Full control, premium design, no dependencies |
| API      | CoinGecko v3     | Free tier available, comprehensive crypto data|
