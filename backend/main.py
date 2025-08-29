from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from google.transit import gtfs_realtime_pb2
import time
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MTA feeds
MTA_FEEDS = {
    "Bronx": "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",
    "BQC": "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc"
}

# Track previous positions with timestamps for speed calculation
previous_positions = {}  # {bus_id: {"lat": .., "lon": .., "time": ..}}

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in meters between two lat/lon points."""
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@app.get("/buses")
async def get_buses():
    buses_data = []
    now = time.time()

    for feed_name, url in MTA_FEEDS.items():
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(url)
                feed = gtfs_realtime_pb2.FeedMessage()
                feed.ParseFromString(response.content)

                for entity in feed.entity:
                    if not entity.HasField("vehicle"):
                        continue

                    bus_id = entity.vehicle.vehicle.id
                    lat = entity.vehicle.position.latitude
                    lon = entity.vehicle.position.longitude

                    # Calculate speed if previous position exists
                    prev = previous_positions.get(bus_id)
                    speed = None
                    status = "Running"

                    if prev:
                        dist = haversine(prev["lat"], prev["lon"], lat, lon)
                        dt = now - prev["time"]
                        if dt > 0:
                            speed = (dist / dt) * 2.23694  # convert m/s to mph

                        # Ghost bus detection: if bus hasn't moved more than 10 meters in last 10 min
                        if dist < 10 and dt > 600:
                            status = "Ghost"
                        # Anomaly detection: if speed > 80 mph
                        elif speed and speed > 80:
                            status = "Anomaly"

                    previous_positions[bus_id] = {"lat": lat, "lon": lon, "time": now}

                    buses_data.append({
                        "id": bus_id,
                        "lat": lat,
                        "lon": lon,
                        "status": status,
                        "feed": feed_name,
                        "speed": speed
                    })

        except Exception as e:
            print(f"Error fetching {feed_name}: {e}")
            continue

    return {"buses": buses_data}
