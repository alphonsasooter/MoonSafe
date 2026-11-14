
import json
import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
SAVED_RESULTS = BASE_DIR / "terrain_results.json"


# -----------------------------------------
# SAVED NASA TERRAIN RESULTS
# -----------------------------------------

def load_saved_results():
    if not SAVED_RESULTS.exists():
        raise FileNotFoundError(
            "terrain_results.json is missing"
        )

    with SAVED_RESULTS.open(
        "r", encoding="utf-8-sig"
    ) as file:
        result = json.load(file)

    comparison = result.get("comparison")

    if not isinstance(comparison, dict):
        raise ValueError(
            "Saved results do not contain comparison data"
        )

    if not all(
        site in comparison
        for site in ("shackleton", "malapert")
    ):
        raise ValueError(
            "Saved results are missing landing sites"
        )

    return result


# -----------------------------------------
# TERRAIN PROCESSING
# -----------------------------------------

def get_terrain_comparison(threshold=10):
    # Render uses saved NASA measurements.
    # Set MOONSAFE_USE_SAVED=true to force
    # saved results in another environment.

    use_saved = (
        os.getenv(
            "MOONSAFE_USE_SAVED", ""
        ).lower() == "true"
        or os.getenv("RENDER") == "true"
    )

    if use_saved:
        result = load_saved_results()
        result["processing_mode"] = "precomputed"
        result["message"] = (
            "NASA terrain statistics loaded "
            "from previously analyzed GeoTIFFs"
        )
        return result

    # Local development uses original rasters.
    try:
        from terrain.analysis import analyze_site

        shackleton = analyze_site(
            "shackleton", threshold
        )
        malapert = analyze_site(
            "malapert", threshold
        )

        return {
            "status": "success",
            "message": "Terrain comparison completed",
            "processing_mode": "live",
            "comparison": {
                "shackleton": shackleton,
                "malapert": malapert
            }
        }

    except FileNotFoundError:
        result = load_saved_results()
        result["processing_mode"] = "precomputed"
        result["message"] = (
            "Using saved NASA terrain statistics"
        )
        return result


# -----------------------------------------
# HOME ROUTE
# -----------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "project": "MoonSafe",
        "description": (
            "Lunar Landing Site Suitability Analysis"
        ),
        "message": "MoonSafe backend is running!",
        "status": "success"
    })


# -----------------------------------------
# HEALTH CHECK API
# -----------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Backend connection successful",
        "project": "MoonSafe"
    })


# -----------------------------------------
# CANDIDATE LANDING SITES
# -----------------------------------------

@app.route("/api/sites", methods=["GET"])
def get_sites():
    sites = [
        {
            "id": "shackleton",
            "name": "Shackleton Rim",
            "dataset": "NASA LOLA Site04"
        },
        {
            "id": "malapert",
            "name": "Malapert Massif",
            "dataset": "NASA LOLA Site23"
        }
    ]

    return jsonify({
        "status": "success",
        "count": len(sites),
        "sites": sites
    })


# -----------------------------------------
# TERRAIN ANALYSIS API
# -----------------------------------------

@app.route(
    "/api/terrain/<site_id>",
    methods=["GET"]
)
def terrain_analysis(site_id):
    try:
        threshold = float(
            request.args.get(
                "slope_threshold", 10
            )
        )

        if not 0 <= threshold <= 90:
            raise ValueError(
                "Slope threshold must be between 0 and 90"
            )

        if site_id not in (
            "shackleton", "malapert"
        ):
            raise ValueError(
                "Unknown landing site"
            )

        result = get_terrain_comparison(
            threshold
        )

        return jsonify({
            "status": "success",
            "processing_mode": result.get(
                "processing_mode"
            ),
            "data": result["comparison"][site_id]
        }), 200

    except FileNotFoundError as error:
        return jsonify({
            "status": "data_missing",
            "message": str(error)
        }), 404

    except ValueError as error:
        return jsonify({
            "status": "invalid_request",
            "message": str(error)
        }), 400

    except Exception:
        app.logger.exception(
            "Terrain analysis failed"
        )
        return jsonify({
            "status": "analysis_error",
            "message": "Unable to process terrain data"
        }), 500


# -----------------------------------------
# COMPARE TWO LANDING SITES
# -----------------------------------------

@app.route(
    "/api/compare-sites",
    methods=["GET"]
)
def compare_sites():
    try:
        threshold = float(
            request.args.get(
                "slope_threshold", 10
            )
        )

        if not 0 <= threshold <= 90:
            raise ValueError(
                "Slope threshold must be between 0 and 90"
            )

        result = get_terrain_comparison(
            threshold
        )

        return jsonify(result), 200

    except FileNotFoundError as error:
        return jsonify({
            "status": "data_missing",
            "message": str(error)
        }), 404

    except ValueError as error:
        return jsonify({
            "status": "invalid_request",
            "message": str(error)
        }), 400

    except Exception:
        app.logger.exception(
            "Site comparison failed"
        )
        return jsonify({
            "status": "analysis_error",
            "message": "Unable to compare landing sites"
        }), 500


# -----------------------------------------
# RUN FLASK SERVER
# -----------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
