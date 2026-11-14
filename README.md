# 🌙 MoonSafe
### Lunar Landing Site Suitability Analysis

**NASA Space Apps Challenge 2026 | Lunar Terrain Intelligence**

MoonSafe is a web-based lunar landing site assessment prototype that uses NASA-derived terrain data to compare potential landing regions near the Moon's south pole.

The platform visualizes lunar imagery, analyzes elevation and slope statistics, calculates prototype terrain safety scores, and generates a landing site recommendation.

### 🌐 Live Demo

**Website:** https://moon-safe.vercel.app/

**GitHub:** https://github.com/alphonsasooter/MoonSafe

## 🚀 Key Features

- **Mission Dashboard:** Interactive overview of lunar landing candidates.
- **NASA Terrain Analysis:** Elevation and slope statistics derived from lunar GeoTIFF datasets.
- **Lunar Map:** Visual exploration of candidate landing regions.
- **Landing Site Safety Analysis:** Comparative prototype suitability scores.
- **Mission Recommendation:** A recommendation based on the implemented scoring logic.
- **API Integration:** React frontend connected to a Flask backend.

## 🌕 Candidate Landing Regions

| Region | Dataset |
|---|---|
| Shackleton Rim | NASA LOLA Site04 |
| Malapert Massif | NASA LOLA Site23 |

The prototype compares terrain characteristics of these two candidate regions. Its safety scores are intended for educational and exploratory comparison, not certified mission planning.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, Flask |
| Geospatial Processing | Rasterio, NumPy |
| Terrain Data | NASA-derived lunar GeoTIFFs |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git, GitHub |
| Deployment | Docker |

## 🏗️ System Architecture

```text
NASA Lunar Terrain Datasets
           |
           v
   GeoTIFF Processing
     Python + Rasterio
           |
           v
   Terrain Statistics
           |
           v
     Flask REST API
           |
           v
   React / Vite Frontend
           |
           v
  MoonSafe Web Dashboard
           |
           +-- Terrain Comparison
           +-- Lunar Map
           +-- Safety Analysis
           +-- Mission Recommendation
```

## ⚙️ How It Works

1. NASA-derived terrain datasets provide elevation and slope measurements.
2. The backend processes or loads previously calculated terrain statistics.
3. MoonSafe compares Shackleton Rim and Malapert Massif.
4. The frontend calculates and displays prototype safety scores.
5. The application presents a mission recommendation based on those scores.

**Deployment note:** The hosted application uses precomputed terrain statistics generated from the original raster datasets. Local development supports direct GeoTIFF processing. The large source rasters are not included in the GitHub repository.

## 💻 Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs at `http://127.0.0.1:5000`.

Live raster processing requires the original terrain files in the paths expected by the backend.

### Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local address displayed by Vite, usually `http://localhost:5173`.

## 📊 Results

MoonSafe demonstrates a functioning terrain comparison workflow with:

- Elevation and slope analysis
- Comparative safety scores
- Candidate landing site selection
- Mission recommendation
- Online frontend and backend integration

## 🔮 Future Enhancements

- Solar illumination analysis
- Earth communication visibility assessment
- Additional landing site candidates
- More detailed hazard detection
- Interactive georeferenced lunar mapping
- Mission-specific safety weighting

## ⚠️ Limitations

MoonSafe is a research and educational prototype. Its terrain-based safety scores do not account for every factor required for an actual lunar landing, including illumination, spacecraft performance, navigation uncertainty, and communication constraints.

## 👩‍🚀 Team

Developed for NASA Space Apps Challenge 2026.

**Project:** MoonSafe

**Repository:** alphonsasooter/MoonSafe

## 📄 Acknowledgments

NASA lunar exploration missions and publicly available lunar terrain data resources.

NASA Space Apps Challenge.
