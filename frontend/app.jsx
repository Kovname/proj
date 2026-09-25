/* ===================================================================
   Crypto Filter — React Application
   =================================================================== */

const { useState, useEffect, useCallback, useMemo } = React;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE = window.location.origin; // backend serves both API and static

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUSD(value) {
    if (value == null) return '—';
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
}

function formatPrice(value) {
    if (value == null) return '—';
    if (value >= 1) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${value.toFixed(6)}`;
}

function formatPercent(value) {
    if (value == null) return '—';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatSupply(value) {
    if (value == null) return '—';
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function Header() {
    return (
        <header className="header">
            <div className="header__badge">Live Data</div>
            <h1 className="header__title">Crypto Project Filter</h1>
            <p className="header__subtitle">Filtered cryptocurrency projects from CoinGecko API</p>
        </header>
    );
}

function Controls({ search, onSearchChange, maxFdv, onMaxFdvChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, onRefresh, loading }) {
    return (
        <div className="controls" id="filter-controls">
            <div className="control-group">
                <label htmlFor="search-input">Search by Name</label>
                <input
                    id="search-input"
                    type="text"
                    placeholder="e.g. eth, bitcoin…"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="control-group">
                <label htmlFor="fdv-input">Max FDV (USD)</label>
                <input
                    id="fdv-input"
                    type="number"
                    placeholder="e.g. 50000000"
                    value={maxFdv}
                    onChange={(e) => onMaxFdvChange(e.target.value)}
                    min="0"
                />
            </div>
            <div className="control-group">
                <label htmlFor="sort-select">Sort By</label>
                <select id="sort-select" value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
                    <option value="">Default</option>
                    <option value="market_cap">Market Cap</option>
                    <option value="total_volume">24h Volume</option>
                </select>
            </div>
            <div className="control-group">
                <label htmlFor="order-select">Order</label>
                <select id="order-select" value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>
            <button
                className="btn-refresh"
                onClick={onRefresh}
                disabled={loading}
                id="refresh-btn"
            >
                {loading ? '⟳ Loading…' : '⟳ Refresh'}
            </button>
        </div>
    );
}

function StatsBar({ count, loading }) {
    return (
        <div className="stats-bar">
            <div className="stat-chip">
                Results: <span className="stat-chip__value">{loading ? '…' : count}</span>
            </div>
            <div className="stat-chip">
                Filters: <span className="stat-chip__value">mcap &gt; 0 · FDV &lt; $100M · Vol &gt; $50K · TVL &gt; $50K · Supply Match</span>
            </div>
        </div>
    );
}

function SortableHeader({ label, field, currentSort, currentOrder, onSort }) {
    const isSorted = currentSort === field;
    const icon = isSorted ? (currentOrder === 'asc' ? '↑' : '↓') : '↕';

    return (
        <th
            className={`sortable ${isSorted ? 'sorted' : ''}`}
            onClick={() => onSort(field)}
        >
            {label}
            <span className="sort-icon">{icon}</span>
        </th>
    );
}

function CoinRow({ coin, index }) {
    const priceChangeClass = coin.price_change_percentage_24h != null
        ? (coin.price_change_percentage_24h >= 0 ? 'value-positive' : 'value-negative')
        : 'value-neutral';

    return (
        <tr style={{ animationDelay: `${Math.min(index * 0.02, 0.2)}s` }}>
            <td>
                <div className="coin-cell">
                    <img
                        className="coin-cell__img"
                        src={coin.image || ''}
                        alt={coin.name}
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="coin-cell__info">
                        <span className="coin-cell__name">{coin.name}</span>
                        <span className="coin-cell__symbol">{coin.symbol}</span>
                    </div>
                </div>
            </td>
            <td>{formatPrice(coin.current_price)}</td>
            <td>{formatUSD(coin.market_cap)}</td>
            <td>{formatUSD(coin.fully_diluted_valuation)}</td>
            <td>{formatUSD(coin.total_volume)}</td>
            <td>{formatUSD(coin.tvl)}</td>
            <td className={priceChangeClass}>{formatPercent(coin.price_change_percentage_24h)}</td>
            <td>{formatSupply(coin.total_supply)}</td>
            <td>
                {coin.preview_listing ? (
                    <span className="tag tag--preview">✓ Preview</span>
                ) : (
                    <span className="tag tag--no">—</span>
                )}
            </td>
        </tr>
    );
}

function CoinTable({ coins, sortBy, sortOrder, onSort, loading }) {
    if (loading) {
        return (
            <div className="table-container">
                <div className="loading-state">
                    <div className="loading-state__spinner"></div>
                    <div className="loading-state__text">Fetching data from CoinGecko…</div>
                    <div className="loading-state__subtext">This may take a minute on first load due to API rate limits</div>
                </div>
            </div>
        );
    }

    if (!coins || coins.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <div className="empty-state__icon">📭</div>
                    <div className="empty-state__title">No projects found</div>
                    <div className="empty-state__desc">
                        No cryptocurrency projects match the current filter criteria.
                        Try adjusting the FDV filter or search query.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-scroll">
                <table id="coins-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Price</th>
                            <SortableHeader label="Market Cap" field="market_cap" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
                            <th>FDV</th>
                            <SortableHeader label="24h Volume" field="total_volume" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
                            <th>TVL</th>
                            <th>24h Change</th>
                            <th>Supply</th>
                            <th>Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin, i) => (
                            <CoinRow key={coin.id} coin={coin} index={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [maxFdv, setMaxFdv] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchCoins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (maxFdv) params.set('max_fdv', maxFdv);
            if (sortBy) params.set('sort_by', sortBy);
            params.set('sort_order', sortOrder);

            const url = `${API_BASE}/api/coins?${params.toString()}`;
            const resp = await fetch(url);

            if (!resp.ok) {
                throw new Error(`API error: ${resp.status} ${resp.statusText}`);
            }

            const data = await resp.json();
            setCoins(data.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, maxFdv, sortBy, sortOrder]);

    useEffect(() => {
        // Debounce the fetch
        const timer = setTimeout(() => {
            fetchCoins();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchCoins]);

    const handleSort = useCallback((field) => {
        setSortBy(prev => {
            if (prev === field) {
                // Toggle order
                setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
                return field;
            }
            setSortOrder('desc');
            return field;
        });
    }, []);

    if (error && coins.length === 0) {
        return (
            <div className="app">
                <Header />
                <div className="table-container">
                    <div className="error-state">
                        <div className="error-state__icon">⚠️</div>
                        <div className="error-state__title">Failed to load data</div>
                        <div className="error-state__desc">{error}</div>
                        <button className="error-state__btn" onClick={fetchCoins}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <Header />
            <Controls
                search={search}
                onSearchChange={setSearch}
                maxFdv={maxFdv}
                onMaxFdvChange={setMaxFdv}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onRefresh={fetchCoins}
                loading={loading}
            />
            <StatsBar count={coins.length} loading={loading} />
            <CoinTable
                coins={coins}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                loading={loading}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
