# RAPID - Post-Disaster Intelligence System

RAPID is a post-disaster geospatial intelligence tool designed to help emergency coordinators instantly analyze affected regions using satellite imagery, calculate priority metrics, and organize rescue efforts.

## Architecture

The system consists of two primary components:
1. **Frontend**: React + Vite application (TailwindCSS, Framer Motion, Zustand, Mapbox GL JS, Turf.js)
2. **Backend**: FastAPI Python backend (Google Earth Engine, GeoPandas)

## Features (Phase 1 & Phase 2)
- **Interactive Geospatial Selection**: Hold `Shift + Click and Drag` to dynamically draw analysis boundaries on a live Mapbox satellite map.
- **Before/After Image Comparison**: Draggable slider to compare satellite imagery pre- and post-disaster.
- **Priority Score Metrics**: Instantly calculates area, estimated affected population, and critical damage score.
- **Geospatial Intelligence Overlays**: Mapbox WebGL overlays for Population Density, Concentric Search Priority Rings, Road Accessibility, and Building Damage.
- **Action Panel**: Slidable panel for allocating emergency resources (Helicopters, Medical Teams, Water Trucks).

## Prerequisites

- Node.js (v18+)
- Python (3.11 recommended for GeoPandas compatibility)
- Mapbox Access Token
- Google Earth Engine Service Account JSON Key

## Setup Guide

### 1. Frontend Setup
```bash
cd rapid-disaster-intel
npm install
```

Create a `.env` file in the `rapid-disaster-intel` directory:
```
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

Start the frontend development server:
```bash
npm run dev
```

### 2. Backend Setup
```bash
cd rapid-backend
py -3.11 -m venv my_env
my_env\Scripts\activate
pip install -r requirements.txt
```

Place your Google Earth Engine Service Account JSON Key in the `rapid-backend` folder named as `gee-service-account.json`.

Start the FastAPI development server:
```bash
uvicorn main:app --reload
```

## Running Tests (Phase 4 Validation)
The backend features comprehensive API unit tests via `pytest`.

```bash
cd rapid-backend
my_env\Scripts\activate
pytest test_main.py -v
```

## Troubleshooting
- **Map Not Loading / Blank Screen**: Ensure that `VITE_MAPBOX_TOKEN` is set in the `.env` file and that you are not running ad-blockers (like Brave Shields) that block WebGL.
- **Python Backend Installation Errors (Shapely/GeoPandas)**: Ensure you are strictly using Python 3.11. Python 3.12 and 3.13 often struggle with pre-compiled spatial wheels on Windows.
- **Server Connectivity Issues**: The frontend defaults to `http://localhost:8000/api/analyze`. Ensure the FastAPI server is running on port 8000.

## Authors
Created as part of the Hackathon.
