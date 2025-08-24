from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from typing import Dict, List, Tuple
import csv
import os
from datetime import datetime

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NUM_BUSES = 30
GHOST_PROBABILITY = 0.15

# --- Data Logging Setup ---
DATA_FILE = "bus_data.csv"
# Create the CSV file with headers if it doesn't exist
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "bus_id", "route", "latitude", "longitude", "status", "speed"])

# 10 distinct routes across Mumbai and Navi Mumbai
ROUTES: Dict[str, List[Tuple[float, float]]] = {
    "Route 1 (Dadar to Colaba)": [
        (19.0196, 72.8432), (18.9967, 72.8255), (18.9575, 72.8335), (18.9219, 72.8347)
    ],
    "Route 2 (Andheri to Ghatkopar)": [
        (19.1197, 72.8464), (19.1018, 72.8687), (19.0863, 72.8858), (19.0851, 72.9095)
    ],
    "Route 3 (Borivali to Thane)": [
        (19.2290, 72.8569), (19.2398, 72.8807), (19.2520, 72.9430), (19.2183, 72.9781)
    ],
    "Route 4 (Vashi to Panvel)": [
        (19.0628, 72.9995), (19.0560, 73.0298), (19.0286, 73.0645), (19.0016, 73.0874)
    ],
    "Route 5 (Kurla to Bandra)": [
        (19.0668, 72.8722), (19.0640, 72.8630), (19.0600, 72.8500), (19.0544, 72.8405)
    ],
    "Route 6 (CSMT to Juhu)": [
        (18.9403, 72.8353), (18.9780, 72.8166), (19.0210, 72.8169), (19.1079, 72.8271)
    ],
    "Route 7 (Thane to Borivali via Ghodbunder)": [
        (19.2183, 72.9781), (19.2511, 72.9645), (19.2750, 72.8760), (19.2290, 72.8569)
    ],
    "Route 8 (Belapur to Kharghar)": [
        (19.0205, 73.0335), (19.0298, 73.0531), (19.0410, 73.0670), (19.0350, 73.0790)
    ],
    "Route 9 (Malad to Powai)": [
        (19.1865, 72.8488), (19.1678, 72.8640), (19.1332, 72.8683), (19.1227, 72.9123)
    ],
    "Route 10 (Chembur to Sion)": [
        (19.0500, 72.8950), (19.0430, 72.8850), (19.0415, 72.8750), (19.0425, 72.8610)
    ]
}

# --- Helper Function for Interpolation ---
def get_interpolated_coords(lat1, lon1, lat2, lon2, steps=150):
    lat_step = (lat2 - lat1) / steps
    lon_step = (lon2 - lon1) / steps
    return [(lat1 + i * lat_step, lon1 + i * lon_step) for i in range(1, steps + 1)]

# --- Bus Initialization ---
buses = []
route_names = list(ROUTES.keys())
bus_id_counter = 1
for route_name in route_names:
    for _ in range(3): # Assign 3 buses to each route
        route_stations = ROUTES[route_name]
        start_index = random.randint(0, len(route_stations) - 1)
        
        buses.append({
            "id": bus_id_counter,
            "route": route_name,
            "station_index": start_index,
            "path": [],
            "path_index": 0,
            "lat": route_stations[start_index][0],
            "lon": route_stations[start_index][1],
            "speed": random.uniform(20, 40),
            "status": "Running",
        })
        bus_id_counter += 1

# --- API Endpoint ---
@app.get("/buses")
def get_buses():
    running_count = 0
    ghost_count = 0
    traffic_factor = random.uniform(0.8, 1.2)
    
    # Open the CSV file in append mode to log new data
    with open(DATA_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        timestamp = datetime.now().isoformat()

        for bus in buses:
            if random.random() < GHOST_PROBABILITY:
                bus["status"] = "Ghost"
            else:
                bus["status"] = "Running"

            if bus["status"] == "Running":
                if not bus["path"] or bus["path_index"] >= len(bus["path"]):
                    route = ROUTES[bus["route"]]
                    current_station_index = bus["station_index"]
                    next_station_index = (current_station_index + 1) % len(route)
                    
                    lat1, lon1 = route[current_station_index]
                    lat2, lon2 = route[next_station_index]

                    bus["path"] = get_interpolated_coords(lat1, lon1, lat2, lon2)
                    bus["path_index"] = 0
                    bus["station_index"] = next_station_index

                bus["lat"], bus["lon"] = bus["path"][bus["path_index"]]
                bus["path_index"] += 1
                
                bus["speed"] += random.uniform(-5, 5) * traffic_factor
                bus["speed"] = max(15, min(60, bus["speed"]))
                running_count += 1
            else:
                ghost_count += 1
            
            # Write the current state of the bus to the CSV file
            writer.writerow([timestamp, bus["id"], bus["route"], bus["lat"], bus["lon"], bus["status"], bus["speed"]])

    return {
        "buses": buses,
        "running_count": running_count,
        "ghost_count": ghost_count,
    }
