
import { useEffect, useState } from "react";
import {
  MapPin,
  Mountain,
  Info,
  ExternalLink,
  Satellite,
  RefreshCw,
} from "lucide-react";
import "./LunarMap.css";

const NASA_IMAGE =
  "https://images-assets.nasa.gov/image/PIA13523/PIA13523~orig.jpg";

const NASA_FALLBACK =
  "https://science.nasa.gov/wp-content/uploads/2023/09/moon-south-pole.jpg";

const sites = [
  {
    id: "shackleton",
    name: "Shackleton Rim",
    latitude: "89.50° S",
    description:
      "A candidate landing region close to the lunar south pole and Shackleton crater.",
  },
  {
    id: "malapert",
    name: "Malapert Massif",
    latitude: "85.99° S",
    description:
      "An elevated candidate landing region in the lunar south polar area.",
  },
];

function formatNumber(value, unit = "") {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return "Not available";
  }

  return `${Number(value).toFixed(2)}${unit}`;
}

export default function LunarMap({
  primarySite = "shackleton",
  secondarySite = "malapert",
  comparisonData = null,
  onSelectSite,
}) {
  const [selected, setSelected] = useState(primarySite);
  const [imageUrl, setImageUrl] = useState(NASA_IMAGE);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setSelected(primarySite);
  }, [primarySite]);

  const activeSite =
    sites.find((site) => site.id === selected) || sites[0];

  // Accepts either the comparison object or a complete API response.
  const comparison =
    comparisonData?.comparison || comparisonData || {};

  const terrain = comparison?.[selected] || null;
  const elevation = terrain?.elevation || {};
  const slope = terrain?.slope || {};

  function selectSite(siteId) {
    setSelected(siteId);

    if (typeof onSelectSite === "function") {
      onSelectSite(siteId);
    }
  }

  function handleImageError() {
    if (imageUrl === NASA_IMAGE) {
      setImageUrl(NASA_FALLBACK);
    } else {
      setImageFailed(true);
    }
  }

  function retryImage() {
    setImageFailed(false);
    setImageUrl(NASA_IMAGE);
  }

  return (
    <section className="lunar-map-section">
      <div className="lunar-map-heading">
        <div>
          <span className="map-kicker">
            <Satellite size={15} />
            NASA LUNAR EXPLORATION
          </span>

          <h2>Lunar Surface Explorer</h2>

          <p>
            Explore lunar south-pole imagery and compare
            candidate landing regions.
          </p>
        </div>

        <span className="map-label">
          NASA IMAGE
        </span>
      </div>

      <div className="lunar-map-toolbar">
        <div className="lunar-site-selector">
          {sites.map((site) => (
            <button
              key={site.id}
              type="button"
              className={`lunar-site-button ${
                selected === site.id ? "active" : ""
              }`}
              onClick={() => selectSite(site.id)}
            >
              <MapPin size={16} />
              {site.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="lunar-refresh-button"
          onClick={retryImage}
        >
          <RefreshCw size={15} />
          Reload image
        </button>
      </div>

      <div className="lunar-map-layout">
        <div className="lunar-map-canvas">
          <div className="lunar-real-map">
            {!imageFailed ? (
              <img
                src={imageUrl}
                alt="NASA lunar surface imagery"
                className="lunar-real-image"
                onError={handleImageError}
              />
            ) : (
              <div className="lunar-image-error">
                <Satellite size={42} />
                <h3>NASA image unavailable</h3>
                <p>
                  The image could not be loaded.
                  Check your internet connection or
                  open the NASA image library.
                </p>
                <button
                  type="button"
                  onClick={retryImage}
                >
                  Try again
                </button>
              </div>
            )}

            <div className="lunar-image-overlay">
              <span className="lunar-image-tag">
                <Satellite size={14} />
                LUNAR SURFACE
              </span>

              <div className="lunar-overlay-text">
                <span>MOONSAFE EXPLORER</span>
                <h3>{activeSite.name}</h3>
                <p>
                  Candidate landing region · {activeSite.latitude}
                </p>
              </div>
            </div>
          </div>

          <div className="map-caption">
            <span>
              NASA LUNAR IMAGERY · REFERENCE VIEW
            </span>

            <a
              href="https://quickmap.lroc.asu.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open interactive lunar map
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="lunar-map-disclaimer">
            <Info size={16} />
            <span>
              The image is a reference photograph, not a
              georeferenced map of the selected site.
              Site selection updates the terrain data,
              not the image location.
            </span>
          </div>
        </div>

        <aside className="lunar-location-info">
          <div className="location-info-icon">
            <Mountain size={24} />
          </div>

          <span className="location-info-kicker">
            SELECTED LANDING REGION
          </span>

          <h3>{activeSite.name}</h3>

          <p className="location-description">
            {activeSite.description}
          </p>

          <div className="location-detail">
            <span>Latitude</span>
            <strong>{activeSite.latitude}</strong>
          </div>

          <div className="lunar-stats-heading">
            <Mountain size={16} />
            Terrain measurements
          </div>

          <div className="location-detail">
            <span>Mean elevation</span>
            <strong>
              {formatNumber(elevation.mean, " m")}
            </strong>
          </div>

          <div className="location-detail">
            <span>Minimum elevation</span>
            <strong>
              {formatNumber(elevation.minimum, " m")}
            </strong>
          </div>

          <div className="location-detail">
            <span>Maximum elevation</span>
            <strong>
              {formatNumber(elevation.maximum, " m")}
            </strong>
          </div>

          <div className="location-detail">
            <span>Mean slope</span>
            <strong>
              {formatNumber(slope.mean, "°")}
            </strong>
          </div>

          <div className="location-detail">
            <span>Maximum slope</span>
            <strong>
              {formatNumber(slope.maximum, "°")}
            </strong>
          </div>

          {!terrain && (
            <div className="lunar-data-warning">
              <Info size={17} />
              <span>
                Run terrain analysis to display
                measurements for this region.
              </span>
            </div>
          )}

          <div className="location-notice">
            <Info size={17} />
            <span>
              Terrain statistics come from your
              MoonSafe backend analysis.
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
