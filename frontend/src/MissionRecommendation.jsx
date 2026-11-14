
import { useEffect, useState } from "react";
import {
  Award,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const API = "/api/compare-sites";

function calculateScore(site) {
  const slope = site?.slope;
  const elevation = site?.elevation;

  if (!slope || !elevation) return null;

  const mean = Number(slope.mean);
  const max = Number(slope.maximum);
  const minElevation = Number(elevation.minimum);
  const maxElevation = Number(elevation.maximum);

  if (
    ![mean, max, minElevation, maxElevation].every(
      Number.isFinite
    )
  ) {
    return null;
  }

  const variation = Math.max(
    0,
    maxElevation - minElevation
  );

  const averageScore = Math.max(
    0,
    100 - (mean / 30) * 100
  );

  const maximumScore = Math.max(
    0,
    100 - (max / 90) * 100
  );

  const variationScore = Math.max(
    0,
    100 - (variation / 6000) * 100
  );

  return Math.round(
    averageScore * 0.5 +
    maximumScore * 0.2 +
    variationScore * 0.3
  );
}

export default function MissionRecommendation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Backend connection failed");
      }

      const json = await response.json();
      setData(json.comparison || json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const shackleton = data
    ? calculateScore(data.shackleton)
    : null;

  const malapert = data
    ? calculateScore(data.malapert)
    : null;

  const valid =
    shackleton !== null && malapert !== null;

  const winner = valid
    ? shackleton > malapert
      ? "Shackleton Rim"
      : malapert > shackleton
      ? "Malapert Massif"
      : "Tie"
    : null;

  return (
    <section className="mission-recommendation">
      <div className="mission-recommendation-header">
        <div>
          <span className="mission-kicker">
            <Award size={16} />
            MOONSAFE DECISION SUPPORT
          </span>
          <h2>Mission Recommendation</h2>
          <p>
            Prototype terrain-based landing site comparison.
          </p>
        </div>

        <button onClick={loadData} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading && <p>Analyzing landing regions...</p>}

      {!loading && error && (
        <div className="mission-warning">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {!loading && !error && !valid && (
        <div className="mission-warning">
          <AlertTriangle size={18} />
          Valid terrain data is unavailable.
        </div>
      )}

      {!loading && !error && valid && (
        <>
          <div className="mission-result">
            <div className="mission-result-icon">
              <CheckCircle2 size={30} />
            </div>

            <span>MODEL RESULT</span>

            <h3>
              {winner === "Tie"
                ? "Both sites have equal scores"
                : `${winner} ranks higher`}
            </h3>

            <p>
              {winner === "Tie"
                ? "Both regions received the same rounded terrain score."
                : `${winner} has the higher score under
                   the current MoonSafe terrain model.`}
            </p>
          </div>

          <div className="mission-score-grid">
            <div>
              <Mountain size={20} />
              <h4>Shackleton Rim</h4>
              <strong>{shackleton}/100</strong>
            </div>

            <div>
              <Mountain size={20} />
              <h4>Malapert Massif</h4>
              <strong>{malapert}/100</strong>
            </div>
          </div>

          <div className="mission-warning">
            <AlertTriangle size={18} />
            This is an educational terrain-only ranking,
            not a NASA-approved landing recommendation.
            Illumination, communications, local hazards
            and other mission constraints are not assessed.
          </div>
        </>
      )}
    </section>
  );
}
