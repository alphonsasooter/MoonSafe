
import numpy as np
import rasterio
from pathlib import Path

DATA_DIR = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "lola"
)

SITES = {
    "shackleton": {
        "name": "Shackleton Rim",
        "elevation": "Site04_final_adj_5mpp_surf.tif",
        "slope": "Site04_final_adj_5mpp_slp.tif"
    },
    "malapert": {
        "name": "Malapert Massif",
        "elevation": "Site23_final_adj_5mpp_surf.tif",
        "slope": "Site23_final_adj_5mpp_slp.tif"
    }
}


def raster_statistics(filename, unit):
    path = DATA_DIR / filename

    if not path.exists():
        raise FileNotFoundError(filename)

    with rasterio.open(path) as src:
        values = src.read(1, masked=True)

        valid = values.compressed()
        valid = valid[np.isfinite(valid)]

        if valid.size == 0:
            raise ValueError("No valid raster measurements")

        stats = {
            "mean": round(float(np.mean(valid)), 3),
            "minimum": round(float(np.min(valid)), 3),
            "maximum": round(float(np.max(valid)), 3),
            "median": round(float(np.median(valid)), 3),
            "std_dev": round(float(np.std(valid)), 3),
            "valid_pixels": int(valid.size),
            "unit": unit
        }

        metadata = {
            "crs": str(src.crs),
            "resolution": list(src.res),
            "width": src.width,
            "height": src.height,
            "bounds": list(src.bounds)
        }

        return stats, metadata


def analyze_site(site_id, slope_threshold=10):

    if site_id not in SITES:
        raise ValueError("Unknown landing site")

    if not 0 < slope_threshold <= 90:
        raise ValueError("Slope threshold must be between 0 and 90")

    site = SITES[site_id]

    elevation_stats, elevation_meta = raster_statistics(
        site["elevation"], "metres"
    )

    slope_stats, slope_meta = raster_statistics(
        site["slope"], "degrees"
    )

    with rasterio.open(DATA_DIR / site["slope"]) as src:
        slope = src.read(1, masked=True)

    valid_slope = slope.compressed()
    valid_slope = valid_slope[np.isfinite(valid_slope)]

    total = valid_slope.size

    thresholds = [5, 10, 15, 20, slope_threshold]

    slope_distribution = {}

    for threshold in sorted(set(thresholds)):
        count = int(np.count_nonzero(valid_slope > threshold))

        slope_distribution[str(threshold)] = {
            "pixels": count,
            "percentage": round(count / total * 100, 3)
        }

    return {
        "site": site["name"],
        "source": "NASA LOLA",
        "processing": "Statistics over complete supplied raster footprint",
        "elevation": elevation_stats,
        "slope": slope_stats,
        "slope_distribution": slope_distribution,
        "selected_threshold_degrees": slope_threshold,
        "raster_metadata": {
            "elevation": elevation_meta,
            "slope": slope_meta
        },
        "score_status": "not_calculated"
    }
