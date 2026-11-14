
from flask import Flask, jsonify, request
from flask_cors import CORS

from terrain.analysis import analyze_site

app = Flask(__name__)
CORS(app)


# -----------------------------------------
# HOME ROUTE
# -----------------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "project": "MoonSafe",
        "description": "Lunar Landing Site Suitability Analysis",
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

@app.route("/api/terrain/<site_id>", methods=["GET"])
def terrain_analysis(site_id):

    try:

        threshold = float(
            request.args.get("slope_threshold", 10)
        )

        result = analyze_site(
            site_id,
            slope_threshold=threshold
        )

        return jsonify({
            "status": "success",
            "data": result
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

@app.route("/api/compare-sites", methods=["GET"])
def compare_sites():

    try:

        threshold = float(
            request.args.get("slope_threshold", 10)
        )

        shackleton = analyze_site(
            "shackleton",
            threshold
        )

        malapert = analyze_site(
            "malapert",
            threshold
        )

        return jsonify({
            "status": "success",
            "message": "Terrain comparison completed",
            "comparison": {
                "shackleton": shackleton,
                "malapert": malapert
            }
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
