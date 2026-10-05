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
    center_lat: float = Field(..., ge=-90, le=90)
    center_lng: float = Field(..., ge=-180, le=180)
    radius_meters: float = Field(..., gt=0, le=100000)

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

        import ee
        import os

        # Attempt to get real satellite imagery for the specific location using GEE
        try:
            point = ee.Geometry.Point([request.center_lng, request.center_lat])
            region = point.buffer(request.radius_meters).bounds()
            
            collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(region) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            
            # Pre-disaster: Median of early 2024
            before_img = collection.filterDate('2024-01-01', '2024-06-01').median().visualize(min=0, max=3000, bands=['B4', 'B3', 'B2'])
            before_url = before_img.getThumbURL({'dimensions': 800, 'region': region, 'format': 'jpg'})
            
            # Post-disaster: Median of late 2024
            after_img = collection.filterDate('2024-08-01', '2024-12-31').median().visualize(min=0, max=3000, bands=['B4', 'B3', 'B2'])
            after_url = after_img.getThumbURL({'dimensions': 800, 'region': region, 'format': 'jpg'})
            
        except Exception as gee_err:
            print(f"GEE Fetch Error: {gee_err}")
            # Fallback to Mapbox Static Image API if GEE fails or no images are found for the date range
            MAPBOX_TOKEN = os.getenv("VITE_MAPBOX_TOKEN", "pk.eyJ1Ijoic2hpdmE2MDgiLCJhIjoiY211dmgyZGNrMHZ2NTM0c2hkN2hsbXJuYSJ9.kLoAF3Uc_r6PxAW4RFurIg")
            zoom = 14 if request.radius_meters < 2000 else 12
            fallback_url = f"https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/{request.center_lng},{request.center_lat},{zoom},0/800x800?access_token={MAPBOX_TOKEN}"
            before_url = fallback_url
            after_url = fallback_url

        response_data = {
            "imagery": {
                "before": {
                    "url": before_url,
                    "date": "Early 2024 (Pre-event)",
                    "satellite": "Sentinel-2"
                },
                "after": {
                    "url": after_url,
                    "date": "Late 2024 (Post-event)",
                    "satellite": "Sentinel-2"
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
