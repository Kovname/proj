"""
Crypto Filter Backend — FastAPI application that fetches and filters
cryptocurrency project data from the CoinGecko API.

Filtering criteria:
  - Market Capitalization > 0
  - preview_listing == true  (see assumptions in README)
  - Max Supply == Total Supply
  - Fully Diluted Valuation (FDV) < $100M
  - 24h Trading Volume > $50k
  - Total Value Locked (TVL) > $50k
"""

import os
import time
import asyncio
import logging
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

COINGECKO_BASE_URL = os.getenv("COINGECKO_BASE_URL", "https://api.coingecko.com/api/v3")
COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "")  # optional, for Pro API
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "300"))  # 5 min default

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory cache
# ---------------------------------------------------------------------------

_cache: dict = {"data": None, "timestamp": 0}


def _is_cache_valid() -> bool:
    return (
        _cache["data"] is not None
        and (time.time() - _cache["timestamp"]) < CACHE_TTL_SECONDS
    )


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Crypto Filter API",
    description="Fetches and filters cryptocurrency data from CoinGecko",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# CoinGecko helpers
# ---------------------------------------------------------------------------

def _build_headers() -> dict:
    """Build request headers (include API key if provided)."""
    headers = {"Accept": "application/json"}
    if COINGECKO_API_KEY:
        # Pro API uses x-cg-pro-api-key header; Demo uses x-cg-demo-api-key
        headers["x-cg-demo-api-key"] = COINGECKO_API_KEY
    return headers


async def _fetch_coins_markets(client: httpx.AsyncClient, page: int = 1, per_page: int = 250) -> list[dict]:
    """Fetch a page of coin market data from CoinGecko."""
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": per_page,
        "page": page,
        "sparkline": "false",
    }
    resp = await client.get(
        f"{COINGECKO_BASE_URL}/coins/markets",
        params=params,
        headers=_build_headers(),
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


async def _fetch_coin_detail(client: httpx.AsyncClient, coin_id: str) -> Optional[dict]:
    """Fetch detailed data for a single coin (includes TVL)."""
    try:
        resp = await client.get(
            f"{COINGECKO_BASE_URL}/coins/{coin_id}",
            params={
                "localization": "false",
                "tickers": "false",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
                "sparkline": "false",
            },
            headers=_build_headers(),
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("Failed to fetch detail for %s: %s", coin_id, exc)
        return None
    except httpx.RequestError as exc:
        logger.warning("Request error for %s: %s", coin_id, exc)
        return None


# ---------------------------------------------------------------------------
# Core filtering logic
# ---------------------------------------------------------------------------

def _passes_market_filters(coin: dict) -> bool:
    """Apply filters that can be checked from /coins/markets data."""
    market_cap = coin.get("market_cap")
    fdv = coin.get("fully_diluted_valuation")
    total_volume = coin.get("total_volume")
    max_supply = coin.get("max_supply")
    total_supply = coin.get("total_supply")

    # Market Cap > 0
    if market_cap is None or market_cap <= 0:
        return False

    # FDV < $100M
    if fdv is None or fdv >= 100_000_000:
        return False

    # 24h Trading Volume > $50k
    if total_volume is None or total_volume <= 50_000:
        return False

    # Max Supply == Total Supply (both must be defined and equal)
    if max_supply is None or total_supply is None:
        return False
    if abs(max_supply - total_supply) > 0.01:  # float tolerance
        return False

    return True


def _format_coin(coin: dict, detail: Optional[dict] = None) -> dict:
    """Format coin data for API response."""
    tvl = None
    preview_listing = None

    if detail:
        market_data = detail.get("market_data", {})
        tvl_data = market_data.get("total_value_locked")
        if tvl_data and isinstance(tvl_data, dict):
            tvl = tvl_data.get("usd")
        elif isinstance(tvl_data, (int, float)):
            tvl = tvl_data

        # preview_listing is a top-level boolean in coin detail
        preview_listing = detail.get("preview_listing", False)

    return {
        "id": coin.get("id"),
        "symbol": coin.get("symbol", "").upper(),
        "name": coin.get("name"),
        "image": coin.get("image"),
        "current_price": coin.get("current_price"),
        "market_cap": coin.get("market_cap"),
        "market_cap_rank": coin.get("market_cap_rank"),
        "fully_diluted_valuation": coin.get("fully_diluted_valuation"),
        "total_volume": coin.get("total_volume"),
        "circulating_supply": coin.get("circulating_supply"),
        "total_supply": coin.get("total_supply"),
        "max_supply": coin.get("max_supply"),
        "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
        "tvl": tvl,
        "preview_listing": preview_listing,
    }


def _collect_market_matches(coins: list[dict]) -> list[dict]:
    """Return only coins that pass market-level criteria."""
    return [c for c in coins if _passes_market_filters(c)]


async def _fetch_page_safely(client: httpx.AsyncClient, page: int) -> Optional[list[dict]]:
    """Fetch one page of coin market data with error handling."""
    try:
        return await _fetch_coins_markets(client, page=page)
    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("Error on page %d: %s", page, exc)
        return None


async def _fetch_all_markets(client: httpx.AsyncClient) -> list[dict]:
    """Fetch multiple pages of coins/markets and pre-filter."""
    pre_filtered: list[dict] = []
    for page in range(1, 21):  # up to 20 pages (5000 coins)
        logger.info("Fetching page %d of coins/markets ...", page)
        coins = await _fetch_page_safely(client, page)
        if not coins:
            break

        pre_filtered.extend(_collect_market_matches(coins))
        # Respect CoinGecko free-tier rate limits (~30 req/min)
        await asyncio.sleep(1.5)

    logger.info("Pre-filtered coins: %d", len(pre_filtered))
    return pre_filtered


def _matches_detail_criteria(formatted: dict) -> bool:
    """Check if enriched coin meets TVL and preview_listing criteria."""
    tvl = formatted.get("tvl")
    if tvl is None or tvl <= 50_000:
        return False
    return formatted.get("preview_listing") is True


async def _enrich_and_filter(client: httpx.AsyncClient, pre_filtered: list[dict]) -> list[dict]:
    """Fetch detail for each coin and apply TVL + preview_listing filters."""
    filtered_coins: list[dict] = []
    for coin in pre_filtered:
        detail = await _fetch_coin_detail(client, coin["id"])
        formatted = _format_coin(coin, detail)
        if _matches_detail_criteria(formatted):
            filtered_coins.append(formatted)
        await asyncio.sleep(1.2)  # Rate limit

    return filtered_coins


async def _fetch_and_filter() -> list[dict]:
    """
    Main pipeline:
    1. Fetch coins from /coins/markets (multiple pages).
    2. Apply market-data filters (mcap, FDV, volume, supply match).
    3. Fetch detail for surviving coins to get TVL & preview_listing.
    4. Apply TVL > $50k filter.
    5. Apply preview_listing == true filter.
    """
    async with httpx.AsyncClient() as client:
        pre_filtered = await _fetch_all_markets(client)
        return await _enrich_and_filter(client, pre_filtered)


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    """Health check."""
    return {"status": "ok", "service": "Crypto Filter API"}


@app.get("/api/coins", responses={502: {"description": "Failed to fetch data from CoinGecko"}})
async def get_filtered_coins(
    search: Optional[str] = Query(None, description="Search by project name (partial match)"),
    max_fdv: Optional[float] = Query(None, description="Maximum FDV filter (USD)"),
    sort_by: Optional[str] = Query(None, description="Sort field: market_cap | total_volume"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc | desc"),
):
    """
    Returns the filtered list of cryptocurrency projects.

    Supports additional query params:
    - search: partial name match (case-insensitive)
    - max_fdv: additional FDV upper-bound filter
    - sort_by: 'market_cap' or 'total_volume'
    - sort_order: 'asc' or 'desc'
    """
    # Use cached data if valid; otherwise fetch fresh
    if _is_cache_valid():
        coins = _cache["data"]
        logger.info("Serving %d coins from cache", len(coins))
    else:
        logger.info("Cache miss — fetching fresh data from CoinGecko ...")
        try:
            coins = await _fetch_and_filter()
            _cache["data"] = coins
            _cache["timestamp"] = time.time()
            logger.info("Fetched and cached %d coins", len(coins))
        except Exception as exc:
            logger.exception("Failed to fetch data")
            raise HTTPException(status_code=502, detail="Failed to fetch data from CoinGecko") from exc

    # --- Additional frontend-driven filters ---

    result = list(coins)

    # Search by name (case-insensitive partial match)
    if search:
        search_lower = search.lower()
        result = [
            c for c in result
            if search_lower in c["name"].lower() or search_lower in c["symbol"].lower()
        ]

    # Additional FDV filter
    if max_fdv is not None:
        result = [c for c in result if c["fully_diluted_valuation"] is not None and c["fully_diluted_valuation"] <= max_fdv]

    # Sorting
    if sort_by in ("market_cap", "total_volume"):
        reverse = sort_order != "asc"
        result.sort(key=lambda c: c.get(sort_by) or 0, reverse=reverse)

    return {
        "count": len(result),
        "data": result,
    }


@app.get("/api/coins/refresh", responses={502: {"description": "Failed to refresh data"}})
async def refresh_cache():
    """Force-refresh the cache."""
    logger.info("Manual cache refresh triggered")
    try:
        coins = await _fetch_and_filter()
        _cache["data"] = coins
        _cache["timestamp"] = time.time()
        return {"status": "ok", "count": len(coins)}
    except Exception as exc:
        logger.exception("Refresh failed")
        raise HTTPException(status_code=502, detail="Failed to refresh data") from exc


# ---------------------------------------------------------------------------
# Static files — serve the frontend
# ---------------------------------------------------------------------------

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend files; fall back to index.html for SPA routing."""
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")
