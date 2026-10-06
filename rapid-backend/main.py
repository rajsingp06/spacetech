from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ee
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RAPID Post-Disaster Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google Earth Engine
# We'll expect the service account JSON path in an environment variable or just a hardcoded path for now
SERVICE_ACCOUNT_JSON = os.getenv("EE_SERVICE_ACCOUNT_JSON", "gee-service-account.json")

def initialize_ee():
    try:
        if os.path.exists(SERVICE_ACCOUNT_JSON):
            credentials = ee.ServiceAccountCredentials('', SERVICE_ACCOUNT_JSON)
            ee.Initialize(credentials)
            print("Successfully initialized Google Earth Engine using Service Account.")
        else:
            print(f"Warning: Service account key not found at {SERVICE_ACCOUNT_JSON}.")
            # Fallback to default local auth if not found
            ee.Initialize()
    except Exception as e:
        print(f"Earth Engine initialization failed: {str(e)}")

# Try initializing on startup
@app.on_event("startup")
async def startup_event():
    initialize_ee()

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "RAPID Backend"}

from pydantic import BaseModel, Field
from fastapi import HTTPException
import time

class AnalysisRequest(BaseModel):
    center_lat: float
    center_lng: float
    radius_meters: float

# Simple in-memory cache for Phase 3 Optimization (TTL: 1 hour)
# In production, this would be Redis
analysis_cache = {}
CACHE_TTL = 3600

@app.post("/api/analyze")
def analyze_zone(request: AnalysisRequest):
    try:
        # Check cache
        cache_key = f"{request.center_lat:.4f}_{request.center_lng:.4f}_{int(request.radius_meters)}"
        cached_data = analysis_cache.get(cache_key)
        
        if cached_data and (time.time() - cached_data['timestamp']) < CACHE_TTL:
            return cached_data['data']

        # Simulate processing delay
        time.sleep(0.5)

        # Mock Data generation based on coordinates (deterministic but varied)
        population = int(3000 + (abs(request.center_lat) * 100))
        damage = round(min(9.9, max(1.0, 5.0 + (abs(request.center_lng) / 10))), 1)

        # Generate High-Res Mapbox Static Image for the 'Before' state
        MAPBOX_TOKEN = os.getenv("VITE_MAPBOX_TOKEN", "pk.eyJ1Ijoic2hpdmE2MDgiLCJhIjoiY211dmgyZGNrMHZ2NTM0c2hkN2hsbXJuYSJ9.kLoAF3Uc_r6PxAW4RFurIg")
        zoom = 15 if request.radius_meters < 1500 else 13
        mapbox_url = f"https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/{request.center_lng},{request.center_lat},{zoom},0/800x800?access_token={MAPBOX_TOKEN}"
        
        before_url = mapbox_url
        after_url = mapbox_url # default to mapbox if GEE fails
        
        # Attempt to get real anomaly heatmap for the 'After' state using GEE
        try:
            # Clamp lat/lng so GEE doesn't crash if map wraps around
            lat = max(min(request.center_lat, 90.0), -90.0)
            lng = (request.center_lng + 180) % 360 - 180
            
            point = ee.Geometry.Point([lng, lat])
            display_radius = max(request.radius_meters, 2000.0)
            region = point.buffer(display_radius).bounds()
            
            collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(region) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            
            # Function to calculate NDVI (Normalized Difference Vegetation Index)
            def get_ndvi(image):
                return image.normalizedDifference(['B8', 'B4']).rename('NDVI')
                
            # Baseline (2023) vs Recent (Late 2024)
            baseline = collection.filterDate('2023-01-01', '2023-12-31').map(get_ndvi).median()
            recent = collection.filterDate('2024-07-01', '2024-12-31').map(get_ndvi).median()
            
            # Anomaly Heatmap: Where did vegetation disappear? (e.g. from floods, landslides, urban destruction)
            # Positive values = Vegetation loss (Damage)
            anomaly = baseline.subtract(recent)
            
            # Visualize Heatmap: Dark grey (No change) -> Blue -> Yellow -> Red (Severe Damage)
            heatmap_vis = {
                'min': -0.1,
                'max': 0.4,
                'palette': ['1a1a1a', '2c7bb6', 'ffffbf', 'd7191c']
            }
            
            anomaly_img = anomaly.visualize(**heatmap_vis)
            after_url = anomaly_img.getThumbURL({'dimensions': 1000, 'region': region, 'format': 'jpg'})
            
        except Exception as gee_err:
            print(f"GEE Fetch Error: {gee_err}")

        response_data = {
            "imagery": {
                "before": {
                    "url": before_url,
                    "date": "Pre-Disaster High-Res (Mapbox)",
                    "satellite": "Maxar / Airbus (0.5m/px)"
                },
                "after": {
                    "url": after_url,
                    "date": "Damage Anomaly Heatmap (GEE)",
                    "satellite": "Sentinel-2 Derived Intelligence"
                }
            },
            "metrics": {
                "population_affected": population,
                "damage_score": damage
            }
        }

        # Store in cache
        analysis_cache[cache_key] = {
            'timestamp': time.time(),
            'data': response_data
        }

        return response_data

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Server error during analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during geographic analysis")
