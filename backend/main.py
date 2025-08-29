# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import time
import json
import requests
from google.transit import gtfs_realtime_pb2

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

MTA_URLS = [
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",   # Bronx
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc"  # Brooklyn, Queens, Staten Island
]

CACHE_KEY = "buses"
CACHE_EXPIRY = 5  # seconds

@app.get("/buses")
def get_buses():
    # Check cache first
    cached = r.get(CACHE_KEY)
    if cached:
        return json.loads(cached)

    buses = []
    now = int(time.time())

    for url in MTA_URLS:
        try:
            # Added timeout + disable caching headers for fresh data
            response = requests.get(url, timeout=5, headers={"Cache-Control": "no-cache"})
            response.raise_for_status()

            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            for entity in feed.entity:
                if entity.HasField("vehicle"):
                    vehicle = entity.vehicle
                    vehicle_id = vehicle.vehicle.id
                    lat = vehicle.position.latitude
                    lon = vehicle.position.longitude
                    timestamp = vehicle.timestamp or now

                    # Calculate bus age
                    age_seconds = now - timestamp

                    # Determine bus status
                    if age_seconds > 15:        
                        status = "ghost"
                    elif age_seconds <= 5:       
                        status = "anomaly"
                    else:                        
                        status = "normal"

                    buses.append({
                        "id": vehicle_id,
                        "lat": lat,
                        "lon": lon,
                        "timestamp": timestamp,
                        "status": status
                    })

        except Exception as e:
            print(f"Error fetching {url}:", e)
            continue

    # Cache for 5 seconds (fetch new data after that)
    r.set(CACHE_KEY, json.dumps(buses), ex=CACHE_EXPIRY)
    return buses
