from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from google.transit import gtfs_realtime_pb2
import time
from typing import Dict, Any, List, Tuple
import sys
from math import radians, sin, cos, sqrt, atan2

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MTA API Configuration ---
MTA_FEEDS = [
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=b",  # Bronx
    "https://gtfsrt.prod.obanyc.com/vehiclePositions?feed_id=bqc" # Brooklyn, Queens, Staten Island
]

# --- In-memory Storage ---
bus_data: Dict[str, Dict[str, Any]] = {}
anomalies: List[Dict[str, Any]] = []

# --- Helper Function for Distance Calculation ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Radius of Earth in kilometers
    
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c * 0.621371 # convert to miles
    return distance

# --- Anomaly Detection Logic ---
def detect_anomalies(bus_id, current_data):
    global anomalies
    
    # Anomaly 1: Speeding
    if current_data['speed'] > 65:
        anomaly = {
            "bus_id": bus_id,
            "type": "Speeding",
            "details": f"Bus reported speed of {current_data['speed']:.1f} mph",
            "timestamp": time.time()
        }
        anomalies.append(anomaly)
        current_data['has_anomaly'] = True

    # Anomaly 2: Teleporting
    if bus_id in bus_data and 'lat' in bus_data[bus_id]:
        prev_data = bus_data[bus_id]
        distance = haversine(prev_data['lat'], prev_data['lon'], current_data['lat'], current_data['lon'])
        time_diff = current_data['timestamp'] - prev_data['timestamp']
        
        # If moved more than 5 miles in under a minute (300 mph)
        if time_diff > 0 and (distance / (time_diff / 3600)) > 300:
            anomaly = {
                "bus_id": bus_id,
                "type": "Teleporting",
                "details": f"Bus moved {distance:.1f} miles in {time_diff:.1f} seconds",
                "timestamp": time.time()
            }
            anomalies.append(anomaly)
            current_data['has_anomaly'] = True
    
    # Clean up old anomalies (older than 5 minutes)
    anomalies = [a for a in anomalies if time.time() - a['timestamp'] < 300]


# --- Data Fetching and Parsing ---
def fetch_mta_data():
    headers = {'User-Agent': 'GhostBusDetector/1.0'}
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
                        
                        new_data = {
                            "id": bus_id,
                            "route": entity.vehicle.trip.route_id,
                            "lat": entity.vehicle.position.latitude,
                            "lon": entity.vehicle.position.longitude,
                            "speed": (entity.vehicle.position.speed * 2.23694) if entity.vehicle.position.HasField('speed') else 0,
                            "timestamp": current_time,
                            "status": "Running",
                            "has_anomaly": False # Reset anomaly flag
                        }
                        
                        detect_anomalies(bus_id, new_data)
                        bus_data[bus_id] = new_data
            else:
                print(f"Error fetching data from {url}. Status code: {response.status_code}", file=sys.stderr)

        except Exception as e:
            print(f"Failed to process data from {url}. Error: {e}", file=sys.stderr)

# --- API Endpoints ---
@app.get("/buses")
def get_buses():
    fetch_mta_data()
    
    current_time = time.time()
    processed_buses = []
    running_count, ghost_count = 0, 0
    
    for bus_id, data in list(bus_data.items()):
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

@app.get("/anomalies")
def get_anomalies():
    return {"anomalies": anomalies}

