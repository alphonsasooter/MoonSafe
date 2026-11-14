
import React from 'react'
import { Activity, Mountain, ShieldAlert } from 'lucide-react'

const thresholds = ['5', '10', '15', '20']

function getPercentage(distribution, threshold) {
  const item = distribution?.[threshold]

  if (item === null || item === undefined) return null

  const value =
    typeof item === 'object'
      ? item.percentage ?? item.percent
      : item

  const number = Number(value)

  return Number.isFinite(number)
    ? Math.max(0, Math.min(100, number))
    : null
}

function Metric({ label, value }) {
  return (
    <div className="ts-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function SiteSafetyCard({ site, data, variant }) {
  const slope = data?.slope
  const elevation = data?.elevation
  const distribution = data?.slope_distribution

  return (
    <article className={`ts-card ${variant}`}>
      <div className="ts-card-heading">
        <div>
          <span className="ts-label">CANDIDATE SITE</span>
          <h3>{site.name}</h3>
        </div>
        <Activity size={21} />
      </div>

      <div className="ts-metrics">
        <Metric
          label="Mean slope"
          value={slope?.mean != null ? `${Number(slope.mean).toFixed(2)}°` : 'N/A'}
        />

        <Metric
          label="Maximum slope"
          value={
            (slope?.maximum ?? slope?.max ?? slope?.max_slope) != null
              ? `${Number(slope.maximum ?? slope.max ?? slope.max_slope).toFixed(2)}°`
              : 'N/A'
          }
        />

        <Metric
          label="Mean elevation"
          value={
            elevation?.mean != null
              ? `${Number(elevation.mean).toFixed(2)} m`
              : 'N/A'
          }
        />

        <Metric
          label="Minimum elevation"
          value={
            elevation?.minimum != null
              ? `${Number(elevation.minimum).toFixed(2)} m`
              : 'N/A'
          }
        />
      </div>

      <div className="ts-divider" />

      <h4>Terrain slope thresholds</h4>

      <p className="ts-description">
        Percentage of raster pixels with slope at or below each threshold.
      </p>

      {thresholds.map(threshold => {
        const percentage = getPercentage(distribution, threshold)

        return (
          <div className="ts-bar-row" key={threshold}>
            <span className="ts-threshold">≤ {threshold}°</span>

            <div className="ts-track">
              <div
                className="ts-fill"
                style={{ width: `${percentage ?? 0}%` }}
              />
            </div>

            <strong>
              {percentage !== null
                ? `${percentage.toFixed(1)}%`
                : 'N/A'}
            </strong>
          </div>
        )
      })}
    </article>
  )
}

export default function TerrainSafety({ siteA, siteB, terrainA, terrainB }) {
  return (
    <section className="section-block" id="terrain-safety">
      <div className="section-heading">
        <div>
          <div className="section-kicker">
            06 / LANDING TERRAIN ANALYSIS
          </div>
          <h3>Terrain Safety Assessment</h3>
        </div>

        <span className="data-status">NASA LOLA DATA</span>
      </div>

      <div className="ts-grid">
        <SiteSafetyCard
          site={siteA}
          data={terrainA}
          variant="ts-cyan"
        />

        <SiteSafetyCard
          site={siteB}
          data={terrainB}
          variant="ts-violet"
        />
      </div>

      <div className="ts-warning">
        <ShieldAlert size={19} />

        <div>
          <strong>Scientific limitation</strong>
          <p>
            These measurements describe the supplied raster footprints.
            They are preliminary terrain indicators, not a validated
            landing-pad safety assessment or an overall site ranking.
          </p>
        </div>
      </div>
    </section>
  )
}
