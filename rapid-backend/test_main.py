from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "RAPID Backend"}

def test_analyze_zone_valid():
    payload = {
        "center_lat": 18.5204,
        "center_lng": 73.8567,
        "radius_meters": 1500
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "imagery" in data
    assert "metrics" in data
    assert "population_affected" in data["metrics"]
    assert "damage_score" in data["metrics"]

def test_analyze_zone_invalid_lat():
    payload = {
        "center_lat": 100.0, # Invalid latitude (>90)
        "center_lng": 73.8567,
        "radius_meters": 1500
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422 # Pydantic Validation Error

def test_analyze_zone_invalid_radius():
    payload = {
        "center_lat": 18.5204,
        "center_lng": 73.8567,
        "radius_meters": -500 # Invalid radius (<0)
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422
