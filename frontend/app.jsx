/* ===================================================================
   Crypto Filter — Apple High-Tech Minimalist React Application
   Calm Halftone Ambient Waves + Dark/Light Theme + Dual Run Modes
   =================================================================== */

const { useState, useEffect, useCallback, useRef } = React;

const API_BASE = window.location.origin;

// ---------------------------------------------------------------------------
// Formatters
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
    return `$${value.toFixed(4)}`;
}

function formatPercent(value) {
    if (value == null) return '—';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

function formatSupply(value) {
    if (value == null) return '—';
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Clean Rounded SVG Icons (Zero Emojis)
// ---------------------------------------------------------------------------

function LogoIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function RefreshIcon({ spinning }) {
    return (
        <svg className={spinning ? 'spin-anim' : ''} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

function ArrowUpIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
        </svg>
    );
}

function ArrowDownIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </svg>
    );
}

function ChevronsUpDownIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 15 12 20 17 15" />
            <polyline points="7 9 12 4 17 9" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

function FilterIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

function AlertCircleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

function DatabaseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

function LayersIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

// ---------------------------------------------------------------------------
// Halftone Wave Calculations (Refactored to reduce complexity & use Math.hypot)
// ---------------------------------------------------------------------------

function computeWaveIntensity(x, y, centers, mouse, t) {
    const dist1 = Math.hypot(x - centers.cx1, y - centers.cy1);
    const dist2 = Math.hypot(x - centers.cx2, y - centers.cy2);

    const wave1 = Math.sin(dist1 * 0.022 - t * 3.5);
    const wave2 = Math.sin(dist2 * 0.018 - t * 2.8) * 0.5;

    let mouseWave = 0;
    if (mouse.active) {
        const mdist = Math.hypot(x - mouse.x, y - mouse.y);
        if (mdist < 260) {
            mouseWave = Math.sin(mdist * 0.035 - t * 4.0) * (1 - mdist / 260) * 0.8;
        }
    }

    const intensity = (wave1 + wave2 + mouseWave + 1.5) / 3.0;
    return Math.min(Math.max(intensity, 0), 1);
}

function drawWaveDot(ctx, x, y, intensity, isDark) {
    const radius = 0.9 + intensity * 2.3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    const alpha = isDark ? 0.05 + intensity * 0.22 : 0.04 + intensity * 0.20;
    ctx.fillStyle = isDark ? `rgba(56, 189, 248, ${alpha})` : `rgba(14, 165, 233, ${alpha})`;
    ctx.fill();
}

// ---------------------------------------------------------------------------
// Calm Ambient Halftone Wave Canvas Background
// ---------------------------------------------------------------------------

function HalftoneCanvas({ theme }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const updateDimensions = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);
        };

        updateDimensions();

        const handleResize = () => {
            updateDimensions();
        };

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        let t = 0;
        const step = 24;

        const render = () => {
            t += 0.005;
            const width = window.innerWidth;
            const height = window.innerHeight;

            ctx.clearRect(0, 0, width, height);

            const isDark = theme === 'dark';
            const centers = {
                cx1: width * 0.35 + Math.sin(t * 1.2) * width * 0.28,
                cy1: height * 0.45 + Math.cos(t * 0.9) * height * 0.25,
                cx2: width * 0.70 + Math.cos(t * 1.0) * width * 0.25,
                cy2: height * 0.55 + Math.sin(t * 1.1) * height * 0.22,
            };
            const mouse = mouseRef.current;

            for (let x = 12; x < width + step; x += step) {
                for (let y = 12; y < height + step; y += step) {
                    const intensity = computeWaveIntensity(x, y, centers, mouse, t);
                    drawWaveDot(ctx, x, y, intensity, isDark);
                }
            }

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [theme]);

    return <canvas ref={canvasRef} className="halftone-canvas" id="halftone-canvas" />;
}

// ---------------------------------------------------------------------------
// Header Component
// ---------------------------------------------------------------------------

function Header({ mode, onToggleMode, theme, onToggleTheme, warning }) {
    return (
        <header className="header">
            <div className="header__top">
                <div className="header__brand">
                    <div className="header__logo-container">
                        <LogoIcon />
                    </div>
                    <div className="header__brand-info">
                        <div className="header__brand-row">
                            <span className="header__brand-title">SPREDO</span>
                        </div>
                        <span className="header__brand-tagline">CRYPTO ASSET SCREENER</span>
                    </div>
                </div>

                <div className="header__actions">
                    <div className="mode-switcher" id="mode-switcher">
                        <button
                            type="button"
                            className={`mode-btn ${mode === 'mock' ? 'mode-btn--active' : ''}`}
                            onClick={() => onToggleMode('mock')}
                            title="Instant offline demo dataset with 10 qualified cryptocurrency projects"
                        >
                            <LayersIcon />
                            <span>Demo Dataset</span>
                        </button>
                        <button
                            type="button"
                            className={`mode-btn ${mode === 'live' ? 'mode-btn--active' : ''}`}
                            onClick={() => onToggleMode('live')}
                            title="Query live CoinGecko API"
                        >
                            <DatabaseIcon />
                            <span>Live API</span>
                        </button>
                    </div>

                    <button
                        className="theme-toggle"
                        onClick={onToggleTheme}
                        aria-label="Toggle dark/light theme"
                        id="theme-toggle-btn"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                </div>
            </div>

            <div className="header__hero">
                {warning && (
                    <div className="hero-badge-row">
                        <span className="hero-warning-pill">
                            <AlertCircleIcon />
                            <span>{warning}</span>
                        </span>
                    </div>
                )}

                <h1 className="header__title">Qualified Cryptocurrency Assets</h1>
                <p className="header__subtitle">
                    Real-time automated screener evaluating valuation ceilings, supply consistency, volume thresholds, TVL lockup, and official preview listings.
                </p>
            </div>
        </header>
    );
}

// ---------------------------------------------------------------------------
// Controls Toolbar
// ---------------------------------------------------------------------------

function Controls({
    search,
    onSearchChange,
    maxFdv,
    onMaxFdvChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    onRefresh,
    loading
}) {
    return (
        <div className="controls" id="filter-controls">
            <div className="control-group control-group--search">
                <label htmlFor="search-input">
                    <SearchIcon />
                    <span>Search Project</span>
                </label>
                <div className="input-wrapper">
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search by token name or symbol…"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="control-group">
                <label htmlFor="fdv-input">
                    <FilterIcon />
                    <span>Max FDV (USD)</span>
                </label>
                <div className="input-wrapper">
                    <input
                        id="fdv-input"
                        type="number"
                        placeholder="e.g. 50000000"
                        value={maxFdv}
                        onChange={(e) => onMaxFdvChange(e.target.value)}
                        min="0"
                    />
                </div>
            </div>

            <div className="control-group">
                <label htmlFor="sort-select">
                    <DatabaseIcon />
                    <span>Sort Field</span>
                </label>
                <div className="select-wrapper">
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => onSortByChange(e.target.value)}
                    >
                        <option value="">Default Ranking</option>
                        <option value="market_cap">Market Cap</option>
                        <option value="total_volume">24h Volume</option>
                    </select>
                </div>
            </div>

            <div className="control-group">
                <label htmlFor="order-btn">
                    <span>Order Direction</span>
                </label>
                <button
                    id="order-btn"
                    className="btn-order"
                    onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
                    title={`Current order: ${sortOrder}`}
                >
                    {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </button>
            </div>

            <div className="control-group control-group--action">
                <span className="control-label-spacer" aria-hidden="true">Action</span>
                <button
                    className="btn-refresh"
                    onClick={onRefresh}
                    disabled={loading}
                    id="refresh-btn"
                >
                    <RefreshIcon spinning={loading} />
                    <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Stats Bar Component with Ultra-Readable Criteria Badges
// ---------------------------------------------------------------------------

function StatsBar({ count, loading, mode }) {
    return (
        <div className="stats-bar">
            <div className="stats-bar__left">
                <div className="stat-chip stat-chip--count">
                    <span className="stat-chip__label">Qualified Assets:</span>
                    <span className="stat-chip__value">{loading ? '…' : count}</span>
                </div>
                <div className="stat-chip stat-chip--source">
                    <span className="stat-chip__label">Mode:</span>
                    <span className="stat-chip__value">{mode === 'mock' ? 'Demo Dataset' : 'CoinGecko Live API'}</span>
                </div>
            </div>

            <div className="stats-bar__criteria" aria-label="Filtering criteria applied">
                <span className="criteria-tag">
                    <span className="criteria-tag__name">MCap &gt; 0</span>
                </span>
                <span className="criteria-tag">
                    <span className="criteria-tag__name">FDV &lt; $100M</span>
                </span>
                <span className="criteria-tag">
                    <span className="criteria-tag__name">Vol &gt; $50K</span>
                </span>
                <span className="criteria-tag">
                    <span className="criteria-tag__name">Supply Match</span>
                </span>
                <span className="criteria-tag">
                    <span className="criteria-tag__name">TVL &gt; $50K</span>
                </span>
                <span className="criteria-tag criteria-tag--preview">
                    <CheckCircleIcon />
                    <span className="criteria-tag__name">Preview Listing</span>
                </span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sortable Table Header
// ---------------------------------------------------------------------------

function SortableHeader({ label, field, currentSort, currentOrder, onSort }) {
    const isSorted = currentSort === field;
    let icon = <ChevronsUpDownIcon />;
    if (isSorted) {
        icon = currentOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />;
    }

    return (
        <th
            className={`sortable ${isSorted ? 'sorted' : ''}`}
            onClick={() => onSort(field)}
        >
            <div className="th-content">
                <span>{label}</span>
                <span className="sort-icon">{icon}</span>
            </div>
        </th>
    );
}

// ---------------------------------------------------------------------------
// Coin Row Component
// ---------------------------------------------------------------------------

function CoinRow({ coin }) {
    let priceChangeClass = 'trend-neutral';
    let trendIcon = null;

    if (coin.price_change_percentage_24h != null) {
        if (coin.price_change_percentage_24h >= 0) {
            priceChangeClass = 'trend-up';
            trendIcon = <ArrowUpIcon />;
        } else {
            priceChangeClass = 'trend-down';
            trendIcon = <ArrowDownIcon />;
        }
    }

    return (
        <tr>
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
            <td className="font-tabular font-semibold">{formatPrice(coin.current_price)}</td>
            <td className="font-tabular">{formatUSD(coin.market_cap)}</td>
            <td className="font-tabular">{formatUSD(coin.fully_diluted_valuation)}</td>
            <td className="font-tabular">{formatUSD(coin.total_volume)}</td>
            <td className="font-tabular font-highlight">{formatUSD(coin.tvl)}</td>
            <td>
                <span className={`trend-pill ${priceChangeClass}`}>
                    {trendIcon}
                    <span className="trend-pill__text">{formatPercent(coin.price_change_percentage_24h)}</span>
                </span>
            </td>
            <td className="font-tabular font-dim">{formatSupply(coin.total_supply)}</td>
            <td>
                {coin.preview_listing ? (
                    <span className="tag-preview">
                        <CheckCircleIcon />
                        <span>Verified</span>
                    </span>
                ) : (
                    <span className="tag-dim">—</span>
                )}
            </td>
        </tr>
    );
}

// ---------------------------------------------------------------------------
// Coin Table Component (Stable scrollbars, zero flicker)
// ---------------------------------------------------------------------------

function CoinTable({ coins, sortBy, sortOrder, onSort, loading }) {
    if (loading) {
        return (
            <div className="table-container">
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <div className="loading-state__title">Synchronizing Coin Data</div>
                    <div className="loading-state__sub">Applying filters and querying API dataset…</div>
                </div>
            </div>
        );
    }

    if (!coins || coins.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <div className="empty-state__icon">
                        <AlertCircleIcon />
                    </div>
                    <div className="empty-state__title">No Projects Found</div>
                    <div className="empty-state__desc">
                        No cryptocurrency projects matched your current search query or FDV filter criteria.
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
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin) => (
                            <CoinRow key={coin.id} coin={coin} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Root App Component
// ---------------------------------------------------------------------------

function App() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);

    const [mode, setMode] = useState(() => {
        return localStorage.getItem('crypto_app_mode') || 'mock';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('crypto_app_theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('crypto_app_theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    const handleToggleMode = useCallback((newMode) => {
        setMode(newMode);
        localStorage.setItem('crypto_app_mode', newMode);
    }, []);

    const [search, setSearch] = useState('');
    const [maxFdv, setMaxFdv] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchCoins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set('mode', mode);
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
            setWarning(data.warning || null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [mode, search, maxFdv, sortBy, sortOrder]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCoins();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCoins]);

    const handleSort = useCallback((field) => {
        setSortBy(prev => {
            if (prev === field) {
                setSortOrder(o => (o === 'desc' ? 'asc' : 'desc'));
                return field;
            }
            setSortOrder('desc');
            return field;
        });
    }, []);

    return (
        <div className="app-wrapper">
            <HalftoneCanvas theme={theme} />

            <div className="app-content">
                <Header
                    mode={mode}
                    onToggleMode={handleToggleMode}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    warning={warning}
                />

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

                <StatsBar count={coins.length} loading={loading} mode={mode} />

                {error && coins.length === 0 ? (
                    <div className="table-container">
                        <div className="empty-state">
                            <div className="empty-state__icon">
                                <AlertCircleIcon />
                            </div>
                            <div className="empty-state__title">Connection Error</div>
                            <div className="empty-state__desc">{error}</div>
                            <button className="btn-refresh" onClick={fetchCoins} style={{ marginTop: '16px' }}>
                                <RefreshIcon spinning={false} />
                                <span>Try Again</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <CoinTable
                        coins={coins}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Mount Application
// ---------------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
