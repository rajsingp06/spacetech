import requests
import json

payload = {
    "center_lat": 18.5204,
    "center_lng": 73.8567,
    "radius_meters": 1000
}

try:
    res = requests.post("http://127.0.0.1:8000/api/analyze", json=payload)
    print("Status:", res.status_code)
    print("Response:", json.dumps(res.json(), indent=2))
except Exception as e:
    print("Error:", e)
