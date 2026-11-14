
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  Activity,
  RefreshCw,
} from "lucide-react";
import "./SafetyAnalysis.css";

const API_URL = "/api/compare-sites";

const SITE_NAMES = {
  shackleton: "Shackleton Rim",
  malapert: "Malapert Massif",
};

function calculateSafety(site) {
  if (!site?.elevation || !site?.slope) return null;

  const elevation = site.elevation;
  const slope = site.slope;

  const meanSlope = Number(slope.mean);
  const maximumSlope = Number(slope.maximum);
  const minimumElevation = Number(elevation.minimum);
  const maximumElevation = Number(elevation.maximum);

  if (
    ![
      meanSlope,
      maximumSlope,
      minimumElevation,
      maximumElevation,
    ].every(Number.isFinite)
  ) {
    return null;
  }

  const elevationRange = Math.max(
    0,
    maximumElevation - minimumElevation
  );

  // Prototype scoring rules, not NASA-certified criteria.
  // Lower slopes and lower elevation variation
  // receive higher scores.

  const meanSlopeScore = Math.max(
    0,
    100 - (meanSlope / 30) * 100
  );

  const maxSlopeScore = Math.max(
    0,
    100 - (maximumSlope / 90) * 100
  );

  const terrainVariationScore = Math.max(
    0,
    100 - (elevationRange / 6000) * 100
  );

  const score = Math.round(
    meanSlopeScore * 0.5 +
    maxSlopeScore * 0.2 +
    terrainVariationScore * 0.3
  );

  let level = "High terrain risk";
  let color = "danger";

  if (score >= 70) {
    level = "Lower terrain risk";
    color = "safe";
  } else if (score >= 40) {
    level = "Moderate terrain risk";
    color = "moderate";
  }

  return {
    score,
    level,
    color,
    meanSlope,
    maximumSlope,
    elevationRange,
    meanSlopeScore: Math.round(meanSlopeScore),
    maxSlopeScore: Math.round(maxSlopeScore),
    terrainVariationScore: Math.round(
      terrainVariationScore
    ),
  };
}

function ScoreCard({ name, result, recommended }) {
  if (!result) return null;

  return (
    <div className="safety-card">
      <div className="safety-card-top">
        <div>
          <span className="safety-card-kicker">
            LANDING CANDIDATE
          </span>
          <h3>{name}</h3>
        </div>

        {recommended && (
          <span className="safety-recommended">
            <CheckCircle2 size={14} />
            Preferred by model
          </span>
        )}
      </div>

      <div className="safety-score-main">
        <div
          className={`safety-score-circle ${result.color}`}
          style={{
            "--score": `${result.score}%`,
          }}
        >
          <div>
            <strong>{result.score}</strong>
            <span>/ 100</span>
          </div>
        </div>

        <div className="safety-score-description">
          <span className={`safety-risk ${result.color}`}>
            {result.level}
          </span>
          <p>
            Prototype terrain suitability score based on
            slope and elevation variation.
          </p>
        </div>
      </div>

      <div className="safety-metrics">
        <div>
          <span>Mean slope</span>
          <strong>
            {result.meanSlope.toFixed(2)}°
          </strong>
        </div>

        <div>
          <span>Maximum slope</span>
          <strong>
            {result.maximumSlope.toFixed(2)}°
          </strong>
        </div>

        <div>
          <span>Elevation variation</span>
          <strong>
            {result.elevationRange.toFixed(0)} m
          </strong>
        </div>
      </div>

      <div className="safety-breakdown">
        <h4>Score breakdown</h4>

        {[
          {
            name: "Average slope",
            value: result.meanSlopeScore,
            weight: "50%",
          },
          {
            name: "Maximum slope",
            value: result.maxSlopeScore,
            weight: "20%",
          },
          {
            name: "Elevation variation",
            value: result.terrainVariationScore,
            weight: "30%",
          },
        ].map((item) => (
          <div className="safety-factor" key={item.name}>
            <div className="safety-factor-label">
              <span>{item.name}</span>
              <span>
                {item.value}/100 · Weight {item.weight}
              </span>
            </div>

            <div className="safety-progress">
              <div
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SafetyAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSafetyData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const json = await response.json();

      const comparison = json.comparison || json;

      if (
        !comparison.shackleton ||
        !comparison.malapert
      ) {
        throw new Error(
          "Landing site data is incomplete."
        );
      }

      setData(comparison);
    } catch (err) {
      setError(err.message || "Analysis failed.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSafetyData();
  }, []);

  const results = data
    ? {
        shackleton: calculateSafety(data.shackleton),
        malapert: calculateSafety(data.malapert),
      }
    : null;

  const bothValid =
    results?.shackleton && results?.malapert;

  let preferred = null;

  if (bothValid) {
    const difference =
      results.shackleton.score -
      results.malapert.score;

    if (difference > 0) preferred = "shackleton";
    if (difference < 0) preferred = "malapert";
  }

  return (
    <section className="safety-analysis">
      <div className="safety-header">
        <div>
          <span className="safety-kicker">
            <ShieldCheck size={16} />
            MOONSAFE RISK ASSESSMENT
          </span>

          <h2>Landing Site Safety Analysis</h2>

          <p>
            Compare terrain-based suitability using
            NASA elevation and slope measurements.
          </p>
        </div>

        <button
          className="safety-refresh"
          type="button"
          onClick={loadSafetyData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Analyzing..." : "Run analysis"}
        </button>
      </div>

      {loading && (
        <div className="safety-message">
          <Activity size={24} />
          <p>Calculating landing site scores...</p>
        </div>
      )}

      {!loading && error && (
        <div className="safety-message safety-error">
          <AlertTriangle size={24} />
          <p>{error}</p>
          <button onClick={loadSafetyData}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && !bothValid && (
        <div className="safety-message safety-error">
          <AlertTriangle size={24} />
          <p>
            The backend did not provide valid
            slope and elevation measurements.
          </p>
        </div>
      )}

      {!loading && !error && bothValid && (
        <>
          <div className="safety-cards">
            {Object.entries(SITE_NAMES).map(
              ([id, name]) => (
                <ScoreCard
                  key={id}
                  name={name}
                  result={results[id]}
                  recommended={preferred === id}
                />
              )
            )}
          </div>

          <div className="safety-recommendation">
            <div className="safety-recommendation-icon">
              <Mountain size={23} />
            </div>

            <div>
              <span>MOONSAFE TERRAIN COMPARISON</span>

              <h3>
                {preferred
                  ? `${SITE_NAMES[preferred]} ranks higher`
                  : "Both sites have equal scores"}
              </h3>

              <p>
                {preferred
                  ? `Based on the prototype scoring
                     formula, ${SITE_NAMES[preferred]}
                     has the higher terrain suitability
                     score. This is not a verified
                     landing safety recommendation.`
                  : `Both sites receive the same
                     rounded terrain suitability score.`}
              </p>
            </div>
          </div>

          <div className="safety-method">
            <AlertTriangle size={17} />
            <p>
              <strong>Important:</strong> This is an
              educational terrain-only scoring model.
              It uses average slope (50%), maximum
              slope (20%), and elevation variation
              (30%). These weights and thresholds are
              prototype assumptions, not official NASA
              landing safety standards. Real landing
              decisions require local hazard maps,
              illumination, communications, and
              mission-specific constraints.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
