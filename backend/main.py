import time
import math
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.transit import gtfs_realtime_pb2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MTA_FEEDS = {
    "Bronx": "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",
    "BQC": "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc"
}

previous_positions = {}  # {bus_id: {"lat": .., "lon": .., "time": ..}}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

@app.get("/buses")
async def get_buses():
    buses_data = []
    now = time.time()
    for feed_name, url in MTA_FEEDS.items():
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url)
                feed = gtfs_realtime_pb2.FeedMessage()
                feed.ParseFromString(response.content)

                for entity in feed.entity:
                    if not entity.HasField("vehicle"):
                        continue
                    bus_id = entity.vehicle.vehicle.id
                    lat = entity.vehicle.position.latitude
                    lon = entity.vehicle.position.longitude

                    prev = previous_positions.get(bus_id)
                    speed = None
                    if prev:
                        dist = haversine(prev["lat"], prev["lon"], lat, lon)
                        dt = now - prev["time"]
                        if dt > 0:
                            speed = (dist / dt) * 2.23694  # m/s → mph

                    # Ghost if not moved for 2 minutes
                    if prev and now - prev["time"] > 120 and prev["lat"] == lat and prev["lon"] == lon:
                        status = "Ghost"
                    elif speed and speed > 80:
                        status = "Anomaly"
                    else:
                        status = "Running"

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
