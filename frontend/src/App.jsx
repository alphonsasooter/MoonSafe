import MissionRecommendation from "./MissionRecommendation";
import "./MissionRecommendation.css";
import SafetyAnalysis from "./SafetyAnalysis";
import { useState } from 'react'
import {
  Activity,
  CalendarDays,
  CircleHelp,
  Clock3,
  Download,
  Globe2,
  Layers3,
  MapPin,
  Menu,
  Moon,
  Radio,
  RefreshCw,
  Satellite,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  TriangleAlert,
  X,
  ArrowUpRight
} from 'lucide-react'

import LunarMap from './LunarMap'
import TerrainSafety from './TerrainSafety'
import './style.css'

const API_URL = '/api/compare-sites' // Requires Vite proxy to Flask on port 5000

const sites = [
  {
    id: 'shackleton',
    name: 'Shackleton Rim',
    region: 'Lunar South Pole',
    latitude: '-89.50°',
    longitude: '0.00°',
    nasaId: 'NASA LOLA Site04',
    description: 'Rim terrain near permanently shadowed regions.'
  },
  {
    id: 'malapert',
    name: 'Malapert Massif',
    region: 'Lunar South Pole',
    latitude: '-85.99°',
    longitude: '0.00°',
    nasaId: 'NASA LOLA Site23',
    description: 'Elevated massif with potential line-of-sight advantages.'
  }
]

function formatValue(value, decimals = 2) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    !Number.isFinite(Number(value))
  ) {
    return 'N/A'
  }

  return Number(value).toFixed(decimals)
}

function formatCount(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return 'N/A'
  }

  return Number(value).toLocaleString()
}

function getMaximumSlope(slope) {
  if (!slope) return null

  return slope.maximum ?? slope.max ?? slope.max_slope ?? null
}

function getDistributionPercentage(distribution, threshold) {
  const item = distribution?.[threshold]

  if (item === null || item === undefined) return null

  const value =
    typeof item === 'object'
      ? item.percentage ?? item.percent
      : item

  return Number.isFinite(Number(value)) ? Number(value) : null
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">
          <Icon size={18} />
        </span>
        <span className="metric-label">{label}</span>
      </div>

      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  )
}

function SlopeDistribution({ title, data, variant = 'cyan' }) {
  const distribution = data?.slope_distribution
  const thresholds = ['5', '10', '15', '20']

  return (
    <div className="slope-distribution">
      <div className="chart-title-row">
        <h4>{title}</h4>
        <span className={`chart-dot ${variant}`} />
      </div>

      <p className="chart-description">
        Reported percentage of raster pixels at each slope threshold (verify threshold direction in backend).
      </p>

      {distribution ? (
        thresholds.map(threshold => {
          const percentage = getDistributionPercentage(
            distribution,
            threshold
          )

          return (
            <div className="slope-bar-item" key={threshold}>
              <div className="slope-bar-label">
                <span>{threshold}° threshold</span>
                <b>
                  {percentage !== null
                    ? `${formatValue(percentage)}%`
                    : 'N/A'}
                </b>
              </div>

              <div className="slope-bar-track">
                <div
                  className={`slope-bar-fill ${variant}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, percentage ?? 0))}%`
                  }}
                />
              </div>
            </div>
          )
        })
      ) : (
        <p className="empty-message">
          Slope distribution is not available.
        </p>
      )}
    </div>
  )
}

function ElevationComparison({ siteA, siteB, dataA, dataB }) {
  const valueA = dataA?.elevation?.mean == null ? NaN : Number(dataA.elevation.mean)
  const valueB = dataB?.elevation?.mean == null ? NaN : Number(dataB.elevation.mean)

  const validA = Number.isFinite(valueA)
  const validB = Number.isFinite(valueB)

  const maximum = Math.max(
    Math.abs(validA ? valueA : 0),
    Math.abs(validB ? valueB : 0),
    1
  )

  const items = [
    { site: siteA, value: valueA, valid: validA, color: 'cyan' },
    { site: siteB, value: valueB, valid: validB, color: 'violet' }
  ]

  return (
    <div className="elevation-chart">
      <div className="chart-description">
        Mean elevation across each supplied raster footprint, in metres.
      </div>

      {items.map(item => (
        <div className="elevation-item" key={item.site.id}>
          <div className="elevation-label">
            <span>{item.site.name}</span>
            <b>
              {item.valid ? `${formatValue(item.value)} m` : 'N/A'}
            </b>
          </div>

          <div className="slope-bar-track">
            <div
              className={`slope-bar-fill ${item.color}`}
              style={{
                width: item.valid
                  ? `${(Math.abs(item.value) / maximum) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      ))}

      <p className="chart-footnote">
        Bar lengths represent absolute mean elevation values. They are not
        landing safety scores.
      </p>
    </div>
  )
}

function SiteComparisonRow({ site, data, symbol }) {
  const meanSlope = data?.slope?.mean

  return (
    <div className="site-score-row">
      <div className="site-identity">
        <div className={`site-symbol ${symbol === 'B' ? 'second' : ''}`}>
          {symbol}
        </div>

        <div>
          <b>{site.name}</b>
          <small>{site.nasaId}</small>
        </div>
      </div>

      <div className="comparison-value">
        <b>
          {meanSlope !== undefined && meanSlope !== null
            ? `${formatValue(meanSlope)}°`
            : 'N/A'}
        </b>
        <small>Mean slope</small>
      </div>
    </div>
  )
}

function SourceCard({
  icon: Icon,
  title,
  description,
  status = 'PENDING'
}) {
  return (
    <div className="source-card">
      <div className="source-icon">
        <Icon size={19} />
      </div>

      <div className="source-copy">
        <b>{title}</b>
        <small>{description}</small>
      </div>

      <span className={`source-status ${status === 'CONNECTED' ? 'connected' : ''}`}>
        {status}
      </span>
    </div>
  )
}

function App() {
  const [primary, setPrimary] = useState('shackleton')
  const [secondary, setSecondary] = useState('malapert')
  const [date, setDate] = useState('2026-11-14')
  const [duration, setDuration] = useState('48')

  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiState, setApiState] = useState('not_connected')
  const [errorMessage, setErrorMessage] = useState('')

  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const siteA = sites.find(site => site.id === primary) ?? sites[0]
  const siteB = sites.find(site => site.id === secondary) ?? sites[1]

  const terrainA = comparisonData?.[primary]
  const terrainB = comparisonData?.[secondary]

  const elevationA = terrainA?.elevation
  const slopeA = terrainA?.slope
  const elevationB = terrainB?.elevation
  const slopeB = terrainB?.slope

  const maximumSlopeA = getMaximumSlope(slopeA)
  const maximumSlopeB = getMaximumSlope(slopeB)

  const backendConnected = apiState === 'connected'

  async function runAnalysis() {
    setLoading(true)
    setErrorMessage('')
    setApiState('loading')

    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Backend returned error ${response.status}`)
      }

      const payload = await response.json()

      if (payload.status !== 'success' || !payload.comparison) {
        throw new Error(payload.message || 'Invalid backend response')
      }

      if (
        !payload.comparison.shackleton ||
        !payload.comparison.malapert
      ) {
        throw new Error(
          'The response does not contain both candidate sites.'
        )
      }

      setComparisonData(payload.comparison)
      setApiState('connected')
    } catch (error) {
      console.error('MoonSafe API error:', error)
      setApiState('error')
      setErrorMessage(error.message || 'Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    setMobileMenu(false)
  }

  function selectPrimary(value) {
    if (value === secondary) {
      setSecondary(primary)
    }

    setPrimary(value)
  }

  function selectSecondary(value) {
    if (value === primary) {
      setPrimary(secondary)
    }

    setSecondary(value)
  }

  function navigate(tab, section) {
    setActiveTab(tab)
    scrollToSection(section)
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Moon size={21} />
            <span />
          </div>

          <div>
            <b>MOONSAFE</b>
            <small>MISSION INTELLIGENCE</small>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => navigate('overview', 'overview')}
          >
            <Layers3 size={17} />
            Mission overview
          </button>

          <button
            className={`nav-item ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => navigate('comparison', 'comparison')}
          >
            <Activity size={17} />
            Site comparison
          </button>

          <button
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => navigate('map', 'lunar-map')}
          >
            <Globe2 size={17} />
            Lunar map
            <span className="nav-soon">NEW</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="workspace-label">MISSION TOOLS</div>

        <nav>
          <button
            className="nav-item"
            onClick={() => scrollToSection('mission-controls')}
          >
            <SlidersHorizontal size={17} />
            Mission parameters
          </button>

          <button
            className="nav-item"
            onClick={() => scrollToSection('data-sources')}
          >
            <Satellite size={17} />
            Data sources
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection">
            <span className="pulse-dot" />
            <div>
              <b>LOCAL WORKSPACE</b>
              <small>Prototype environment</small>
            </div>
          </div>

          <div className="version">MOONSAFE BUILD 0.4.0</div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span>
            <b>
              {activeTab === 'comparison'
                ? 'Site comparison'
                : activeTab === 'map'
                  ? 'Lunar map'
                  : 'Mission overview'}
            </b>
          </div>

          <div className="topbar-right">
            <div className="live-indicator">
              <span className={`live-dot ${backendConnected ? 'connected' : ''}`} />
              {backendConnected ? 'BACKEND CONNECTED' : 'LOCAL WORKSPACE'}
            </div>

            <div className="avatar">MS</div>
          </div>
        </header>

        <div className="page-wrap" id="overview">

          {/* PAGE HEADING */}

          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                LUNAR SOUTH POLE · MISSION PLANNER
              </div>

              <h1>
                Mission <span>overview</span>
              </h1>

              <p className="subtitle">
                Evaluate candidate landing zones using terrain,
                illumination and communication analysis.
              </p>
            </div>

            <div className="heading-actions">
              <button className="icon-button" title="Help">
                <CircleHelp size={17} />
              </button>

              <button
                className="outline-button"
                onClick={() => window.print()}
              >
                <Download size={15} />
                Export view
              </button>
            </div>
          </section>

          {/* HERO PANEL */}

          <section className="hero-panel">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="hero-dot" />
                MISSION PLANNING ENVIRONMENT
              </div>

              <h2>
                Find the safest path
                <br />
                to the <em>lunar surface.</em>
              </h2>

              <p>
                Compare candidate sites using a unified mission
                suitability framework. Every metric is designed
                to be traceable to its source and calculation.
              </p>

              <div className="hero-meta">
                <span><MapPin size={14} /> Lunar South Pole</span>
                <span><CalendarDays size={14} /> {date}</span>
                <span><Clock3 size={14} /> {duration} hour window</span>
              </div>
            </div>

            <div className="moon-visual">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />

              <div className="moon-disc">
                <div className="crater c1" />
                <div className="crater c2" />
                <div className="crater c3" />
                <div className="crater c4" />
                <div className="crater c5" />
                <div className="moon-shadow" />
              </div>

              <div className="moon-label label-top">
                LUNAR SOUTH POLE
                <span>89.5° S</span>
              </div>

              <div className="moon-label label-bottom">
                <span className="legend-dot" />
                TARGET REGION
              </div>
            </div>

            <div className="hero-index">
              01 <span>/</span> 04
            </div>
          </section>
                    {/* MISSION PARAMETERS */}

          <section className="section-block" id="mission-controls">
            <div className="section-heading">
              <div>
                <div className="section-kicker">01 / CONFIGURATION</div>
                <h3>Mission parameters</h3>
              </div>

              <span className="section-note">DEFINE YOUR ANALYSIS WINDOW</span>
            </div>

            <div className="parameter-panel">
              <div className="field-group">
                <label>PRIMARY LANDING SITE</label>

                <div className="select-wrap">
                  <MapPin size={16} />
                  <select
                    value={primary}
                    onChange={event => selectPrimary(event.target.value)}
                  >
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <small>
                  {siteA.region} · {siteA.latitude}, {siteA.longitude}
                </small>
              </div>

              <div className="field-group">
                <label>COMPARISON SITE</label>

                <div className="select-wrap">
                  <MapPin size={16} />
                  <select
                    value={secondary}
                    onChange={event => selectSecondary(event.target.value)}
                  >
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <small>
                  {siteB.region} · {siteB.latitude}, {siteB.longitude}
                </small>
              </div>

              <div className="field-group">
                <label>MISSION START DATE</label>

                <div className="input-wrap">
                  <CalendarDays size={16} />
                  <input
                    type="date"
                    value={date}
                    onChange={event => setDate(event.target.value)}
                  />
                </div>

                <small>Mission-local analysis date</small>
              </div>

              <div className="field-group duration-field">
                <label>MISSION WINDOW</label>

                <div className="input-wrap">
                  <Clock3 size={16} />
                  <select
                    value={duration}
                    onChange={event => setDuration(event.target.value)}
                  >
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="168">7 days</option>
                  </select>
                </div>

                <small>SPICE analysis not yet connected</small>
              </div>

              <button
                className="analyze-button"
                onClick={runAnalysis}
                disabled={loading}
              >
                <span>{loading ? 'ANALYZING...' : 'RUN ANALYSIS'}</span>
                {loading
                  ? <RefreshCw size={16} className="spin" />
                  : <ArrowUpRight size={17} />}
              </button>
            </div>
          </section>

          {/* BACKEND STATUS */}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">BACKEND CONNECTION</div>
                <h3>Analysis status</h3>
              </div>

              <span className="data-status">
                {apiState === 'connected'
                  ? 'NASA LOLA DATA CONNECTED'
                  : apiState === 'loading'
                    ? 'PROCESSING DATA'
                    : apiState === 'error'
                      ? 'CONNECTION ERROR'
                      : 'WAITING FOR ANALYSIS'}
              </span>
            </div>

            <div className={`panel status-panel ${apiState}`}>
              {apiState === 'not_connected' && (
                <p>
                  <Activity size={17} />
                  Click RUN ANALYSIS to retrieve terrain measurements
                  from the Flask backend.
                </p>
              )}

              {apiState === 'loading' && (
                <p>
                  <RefreshCw size={16} className="spin" />
                  Reading terrain data from the Flask backend...
                </p>
              )}

              {apiState === 'connected' && (
                <p>
                  <ShieldCheck size={17} />
                  Successfully received terrain data for both candidate sites.
                </p>
              )}

              {apiState === 'error' && (
                <div className="error-content">
                  <p>
                    <TriangleAlert size={17} />
                    Unable to retrieve terrain data.
                  </p>

                  <p className="error-message">{errorMessage}</p>

                  <button className="outline-button" onClick={runAnalysis}>
                    Try again
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* TERRAIN METRICS */}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">02 / TERRAIN ASSESSMENT</div>
                <h3>{siteA.name} terrain measurements</h3>
              </div>

              <span className="data-status">
                {terrainA ? 'LIVE API DATA' : 'AWAITING DATA'}
              </span>
            </div>

            <div className="metrics-grid">
              <MetricCard
                icon={Activity}
                label="MEAN SLOPE"
                value={
                  slopeA?.mean !== undefined
                    ? `${formatValue(slopeA.mean)}°`
                    : 'N/A'
                }
                detail="Average slope across supplied raster"
              />

              <MetricCard
                icon={Layers3}
                label="MEAN ELEVATION"
                value={
                  elevationA?.mean !== undefined
                    ? `${formatValue(elevationA.mean)} m`
                    : 'N/A'
                }
                detail="Average elevation across supplied raster"
              />

              <MetricCard
                icon={TriangleAlert}
                label="MAXIMUM SLOPE"
                value={
                  maximumSlopeA !== null
                    ? `${formatValue(maximumSlopeA)}°`
                    : 'N/A'
                }
                detail="Maximum reported slope"
              />

              <MetricCard
                icon={ShieldCheck}
                label="VALID PIXELS"
                value={formatCount(elevationA?.valid_pixels)}
                detail="Elevation raster valid pixels"
              />
            </div>
          </section>

          {/* SITE COMPARISON */}

          <section className="section-block" id="comparison">
            <div className="section-heading">
              <div>
                <div className="section-kicker">03 / COMPARATIVE ANALYSIS</div>
                <h3>Candidate site comparison</h3>
              </div>

              <span className="section-note">ACTUAL TERRAIN MEASUREMENTS</span>
            </div>

            <div className="analysis-grid">
              <div className="panel comparison-panel">
                <div className="panel-heading">
                  <div>
                    <div className="section-kicker">NASA LOLA</div>
                    <h3>Terrain comparison</h3>
                  </div>

                  <span className="panel-tag">
                    {backendConnected ? 'CONNECTED' : 'NOT ANALYSED'}
                  </span>
                </div>

                <SiteComparisonRow
                  site={siteA}
                  data={terrainA}
                  symbol="A"
                />

                <SiteComparisonRow
                  site={siteB}
                  data={terrainB}
                  symbol="B"
                />

                <div className="winner-note">
                  <Activity size={17} />
                  <span>
                    <b>Terrain data comparison</b>
                    <small>
                      No landing-site winner is assigned from whole-raster
                      statistics alone.
                    </small>
                  </span>
                </div>

                <div className="terrain-comparison-values">
                  <h4>Mean elevation</h4>
                  <p>{siteA.name}: {formatValue(elevationA?.mean)} m</p>
                  <p>{siteB.name}: {formatValue(elevationB?.mean)} m</p>

                  <h4>Maximum slope</h4>
                  <p>
                    {siteA.name}: {maximumSlopeA !== null
                      ? `${formatValue(maximumSlopeA)}°`
                      : 'N/A'}
                  </p>
                  <p>
                    {siteB.name}: {maximumSlopeB !== null
                      ? `${formatValue(maximumSlopeB)}°`
                      : 'N/A'}
                  </p>

                  <h4>Valid elevation pixels</h4>
                  <p>{siteA.name}: {formatCount(elevationA?.valid_pixels)}</p>
                  <p>{siteB.name}: {formatCount(elevationB?.valid_pixels)}</p>
                </div>
              </div>

              <div className="panel breakdown-panel">
                <div className="panel-heading">
                  <div>
                    <div className="section-kicker">04 / SLOPE ANALYSIS</div>
                    <h3>Slope distribution</h3>
                  </div>

                  <Activity size={18} />
                </div>

                <SlopeDistribution
                  title={siteA.name}
                  data={terrainA}
                  variant="cyan"
                />

                <SlopeDistribution
                  title={siteB.name}
                  data={terrainB}
                  variant="violet"
                />

                <div className="caution-box">
                  <TriangleAlert size={17} />
                  <p>
                    <b>Scientific note</b>
                    These percentages describe reported slope thresholds
                    across the supplied raster footprints. They do not
                    establish the safety of a specific landing pad.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TERRAIN SAFETY ASSESSMENT */}
          <TerrainSafety siteA={siteA} siteB={siteB} terrainA={terrainA} terrainB={terrainB} />

          {/* ELEVATION CHART */}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">06 / ELEVATION ANALYSIS</div>
                <h3>Mean elevation comparison</h3>
              </div>

              <span className="section-note">NASA LOLA MEASUREMENTS</span>
            </div>

            <div className="panel chart-panel">
              <ElevationComparison
                siteA={siteA}
                siteB={siteB}
                dataA={terrainA}
                dataB={terrainB}
              />
            </div>
          </section>

          {/* ADDITIONAL ANALYSIS */}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">07 / ADDITIONAL ANALYSIS</div>
                <h3>Mission suitability inputs</h3>
              </div>

              <span className="section-note">SCIENTIFIC DATA STATUS</span>
            </div>

            <div className="source-grid">
              <SourceCard
                icon={Sun}
                title="Sunlight availability"
                description="SPICE analysis not integrated"
              />

              <SourceCard
                icon={Radio}
                title="Earth visibility"
                description="SPICE and horizon analysis pending"
              />

              <SourceCard
                icon={Activity}
                title="Thermal suitability"
                description="Thermal dataset not integrated"
              />
            </div>
          </section>

          {/* SCORING MODEL */}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">08 / SCORING MODEL</div>
                <h3>Proposed suitability framework</h3>
              </div>
            </div>

            <div className="panel scoring-panel">
              <div className="formula-box">
                <span className="formula-label">PROPOSED WEIGHTED MODEL</span>

                <div className="formula">
                  S = 0.35T + 0.30L
                  <br />
                  + 0.25E + 0.10H
                </div>
              </div>

              <div className="weight-list">
                <div>
                  <span className="weight-dot cyan-bg" />
                  <span>Terrain safety</span>
                  <b>35%</b>
                </div>

                <div>
                  <span className="weight-dot gold-bg" />
                  <span>Sunlight availability</span>
                  <b>30%</b>
                </div>

                <div>
                  <span className="weight-dot violet-bg" />
                  <span>Earth visibility</span>
                  <b>25%</b>
                </div>

                <div>
                  <span className="weight-dot gray-bg" />
                  <span>Thermal suitability</span>
                  <b>10%</b>
                  <small>DATA PENDING</small>
                </div>
              </div>

              <div className="caution-box">
                <TriangleAlert size={17} />
                <p>
                  <b>Scientific note</b>
                  A complete suitability score is not calculated yet.
                  Sunlight, Earth visibility and thermal inputs must be
                  validated first. Critical terrain hazards must also
                  be assessed independently.
                </p>
              </div>
            </div>
          </section>

          {/* INTERACTIVE LUNAR MAP */}

          <section id="lunar-map" className="section-block">
            <LunarMap
              primarySite={primary}
              secondarySite={secondary}
              comparisonData={comparisonData}
              onSelectSite={selectPrimary}
            />
          </section>

          {/* DATA SOURCES */}

          <section className="section-block" id="data-sources">
            <div className="section-heading">
              <div>
                <div className="section-kicker">09 / TRACEABILITY</div>
                <h3>Data & calculation status</h3>
              </div>

              <span className="section-note">SOURCE TRANSPARENCY</span>
            </div>

            <div className="source-grid">
              <SourceCard
                icon={Layers3}
                title="LOLA terrain products"
                description="Elevation and slope GeoTIFF"
                status={backendConnected ? 'CONNECTED' : 'PENDING'}
              />

              <SourceCard
                icon={Satellite}
                title="NASA SPICE toolkit"
                description="Sun and Earth geometry"
              />

              <SourceCard
                icon={Globe2}
                title="Local horizon model"
                description="Terrain obstruction analysis"
              />
            </div>
          </section>

          {/* BACKEND RESPONSE */}

          {comparisonData && (
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">DEVELOPER INFORMATION</div>
                  <h3>Backend response</h3>
                </div>
              </div>

              <div className="panel">
                <pre className="terrain-json">
                  {JSON.stringify(comparisonData, null, 2)}
                </pre>
              </div>
            </section>
          )}
         
          {/* LANDING SITE SAFETY ANALYSIS */}
<section id="safety-analysis">
  <SafetyAnalysis />
</section>

{/* FINAL MISSION RECOMMENDATION */}
<section id="mission-recommendation">
  <MissionRecommendation />
</section>
          {/* FOOTER */}

          <footer className="footer">
            <div className="footer-brand">
              <Moon size={16} />
              MOONSAFE
              <span>·</span>
              LUNAR SITE INTELLIGENCE
            </div>

            <div>
              NASA SPACE APPS CHALLENGE PROJECT
              <span>·</span>
              BUILD 0.4.0
            </div>
          </footer>
        </div>
      </main>

      {mobileMenu && (
        <button
          className="mobile-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  )
}

export default App