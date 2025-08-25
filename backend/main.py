from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from google.transit import gtfs_realtime_pb2
import time
from typing import Dict, Any
import sys

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MTA API Configuration ---
# These are the new, correct, public URLs for the bus data feeds.
MTA_FEEDS = [
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",  # Bronx
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc" # Brooklyn, Queens, Staten Island
]

# In-memory storage for bus data
bus_data: Dict[str, Dict[str, Any]] = {}

# --- Helper Function to Fetch and Parse Data ---
def fetch_mta_data():
    headers = {
        'User-Agent': 'GhostBusDetector/1.0 (https://github.com/ShubhamP7769/Ghost-Bus-Detector)'
    }
    
    current_time = time.time()
    
    for url in MTA_FEEDS:
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                feed = gtfs_realtime_pb2.FeedMessage()
                feed.MergeFromString(response.content)
                
                for entity in feed.entity:
                    if entity.HasField('vehicle'):
                        bus_id = entity.vehicle.vehicle.id
                        
                        bus_data[bus_id] = {
                            "id": bus_id,
                            "route": entity.vehicle.trip.route_id,
                            "lat": entity.vehicle.position.latitude,
                            "lon": entity.vehicle.position.longitude,
                            "speed": (entity.vehicle.position.speed * 2.23694) if entity.vehicle.position.HasField('speed') else 0,
                            "timestamp": current_time,
                            "status": "Running"
                        }
            else:
                print(f"Error fetching data from {url}. Status code: {response.status_code}", file=sys.stderr)
                print(f"Response: {response.text}", file=sys.stderr)

        except requests.exceptions.RequestException as e:
            print(f"Request error fetching data from {url}: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Failed to parse data from {url}. Error: {e}", file=sys.stderr)
            print(f"Response content preview: {response.content[:500]}", file=sys.stderr)

# --- API Endpoint ---
@app.get("/buses")
def get_buses():
    fetch_mta_data()
    
    current_time = time.time()
    processed_buses = []
    
    running_count = 0
    ghost_count = 0
    
    for bus_id, data in list(bus_data.items()):
        # A bus is a "ghost" if its data hasn't been updated in over 3 minutes
        if current_time - data["timestamp"] > 180:
            data["status"] = "Ghost"
            ghost_count += 1
        else:
            data["status"] = "Running"
            running_count += 1
        
        processed_buses.append(data)

    return {
        "buses": processed_buses,
        "running_count": running_count,
        "ghost_count": ghost_count
    }
