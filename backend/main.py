# THIS IS A TEST TO CONFIRM THE UPDATE PROCESS
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NUM_BUSES = 30
GHOST_PROBABILITY = 0.1

# Extended routes with multiple stations in Mumbai
ROUTES = {
    "Route 1": [
        (19.0760,72.8777),(19.0770,72.8800),(19.0780,72.8830),(19.0790,72.8850),
        (19.0800,72.8870),(19.0810,72.8890),(19.0820,72.8910),(19.0830,72.8930),
        (19.0840,72.8950),(19.0850,72.8970)
    ],
    "Route 2": [
        (19.0700,72.8700),(19.0710,72.8720),(19.0720,72.8740),(19.0730,72.8760),
        (19.0740,72.8780),(19.0750,72.8800),(19.0760,72.8820),(19.0770,72.8840),
        (19.0780,72.8860),(19.0790,72.8880)
    ],
    "Route 3": [
        (19.0800,72.8800),(19.0810,72.8820),(19.0820,72.8840),(19.0830,72.8860),
        (19.0840,72.8880),(19.0850,72.8900),(19.0860,72.8920),(19.0870,72.8940),
        (19.0880,72.8960),(19.0890,72.8980)
    ],
    "Route 4": [
        (19.0650,72.8700),(19.0660,72.8720),(19.0670,72.8740),(19.0680,72.8760),
        (19.0690,72.8780),(19.0700,72.8800),(19.0710,72.8820),(19.0720,72.8840),
        (19.0730,72.8860),(19.0740,72.8880)
    ]
}

# Initialize 30 buses randomly across routes
buses = []
route_names = list(ROUTES.keys())
for i in range(1, NUM_BUSES + 1):
    route = random.choice(route_names)
    buses.append({
        "id": i,
        "route": route,
        "route_index": 0,  # current station index
        "lat": ROUTES[route][0][0],
        "lon": ROUTES[route][0][1],
        "speed": random.uniform(20, 40),
        "status": "Running"
    })

@app.get("/buses")
def get_buses():
    running_count = 0
    ghost_count = 0
    for bus in buses:
        route = ROUTES[bus["route"]]
        # Move to next station
        next_index = (bus["route_index"] + 1) % len(route)
        bus["lat"], bus["lon"] = route[next_index]
        bus["route_index"] = next_index

        bus["speed"] = random.uniform(20, 40)

        # Ghost bus probability
        if random.random() < GHOST_PROBABILITY:
            bus["status"] = "Ghost"
            ghost_count += 1
        else:
            bus["status"] = "Running"
            running_count += 1

    return {
        "buses": buses,
        "running_count": running_count,
        "ghost_count": ghost_count
    }
