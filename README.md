# MoonSafe

A React + Vite frontend and Flask API scaffold for a lunar landing-site decision-support prototype.

## Important scientific status

The current dashboard contains **illustrative placeholder values only** for interface development. They are not NASA measurements, not validated landing-site scores, and must not be presented as scientific results. The Flask comparison endpoint currently validates inputs and explicitly reports that LOLA/SPICE analysis is pending.

## Requirements

- Windows 11
- Python 3.10+
- Node.js LTS and npm
- VS Code (recommended)

## Run the backend (PowerShell)

```powershell
cd MoonSafe\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend: http://127.0.0.1:5000
Health check: http://127.0.0.1:5000/api/health

If PowerShell blocks virtual-environment activation, run this in that terminal and retry:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Run the frontend (second terminal)

```powershell
cd MoonSafe\frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

## Next scientific implementation milestones

1. Replace temporary site coordinates with sourced, documented candidate coordinates and site footprints.
2. Integrate NASA LOLA elevation/slope rasters using their actual CRS, units, nodata and uncertainty metadata.
3. Integrate suitable NAIF SPICE kernels and validate frame/time conversions.
4. Compute solar and Earth geometry at a documented sampling cadence.
5. Model local terrain horizon obstruction; geometric elevation alone does not prove line of sight.
6. Define and validate component scoring, missing-data handling and independent critical-hazard flags.
7. Replace all illustrative dashboard values with API-backed calculations and provenance.
