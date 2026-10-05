import ee
import os

SERVICE_ACCOUNT_JSON = "gee-service-account.json"
try:
    if os.path.exists(SERVICE_ACCOUNT_JSON):
        print("Found JSON, initializing...")
        credentials = ee.ServiceAccountCredentials('', SERVICE_ACCOUNT_JSON)
        ee.Initialize(credentials)
        print("Successfully initialized!")
        
        point = ee.Geometry.Point([73.8567, 18.5204])
        region = point.buffer(1000).bounds()
        
        collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(region) \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        
        before_img = collection.filterDate('2024-01-01', '2024-06-01').median().visualize(min=0, max=3000, bands=['B4', 'B3', 'B2'])
        before_url = before_img.getThumbURL({'dimensions': 800, 'region': region, 'format': 'jpg'})
        print("Before URL:", before_url)
    else:
        print("JSON not found")
except Exception as e:
    print(f"Error: {e}")
