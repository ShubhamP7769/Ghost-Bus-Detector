Ghost Bus Detector

Ghost Bus Detector is a real-time transit monitoring system that tracks buses using GTFS-Realtime feeds, detects ‘ghost’ buses (inactive or stale), and visualizes them on an interactive map using React and Leaflet, supported by a Python FastAPI backend.


Features:

* Fetches **live GTFS-Realtime** data from MTA (NYC)
* Detects ghost buses based on inactivity (>3 minutes)
* Interactive map using React + Leaflet
* Visual styling with colored, outlined **CircleMarkers** for smoother rendering at scale
* FastAPI backend serving `/buses` endpoint
* Info panel for details on click: ID, route, speed, status
* Auto-refreshes every 15 seconds (frontend)


Installation and Setup:

Frontend
```bash
git clone https://github.com/ShubhamP7769/Ghost-Bus-Detector.git
cd Ghost-Bus-Detector/frontend-new

npm install
npm start
```

Backend
```bash
cd ../backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

---

Usage:

1. Launch both frontend and backend as shown above.
2. Open your browser at `http://localhost:3000` to see the map.
3. On the map:

   * **Green dots** = Running buses
   * **Red dots** = Ghost buses (inactive)
4. Click a marker to open a panel with bus details.
5. The dashboard refreshes automatically every 15 seconds.

---

Styling Improvements:

To enhance performance and visual clarity, buses are now rendered as **CircleMarkers** with:

* **Radius = 4**
* **Fill color** = green or red (based on status)
* **Thin outline** and **opacity = 0.7**
  This keeps the map smooth even with many buses.

---

Architecture Overview:

Backend (FastAPI):

* Retrieves real-time bus data via GTFS-Realtime.
* Maintains in-memory store to track timestamps and detect ghost buses.
* Exposes `/buses` endpoint with live data in JSON.

Frontend (React + Leaflet):

* Polls `/buses` endpoint every 15 seconds.
* Renders CircleMarkers for each bus.
* Auto-refreshes map and updates counts.
* Includes interactive tooltips and info popups.

---

Future Enhancements:

* Add clustering to improve readability at lower zoom levels
* Deploy backend for broader access (e.g., Render, Heroku)
* Integrate heatmaps or dynamic filters by route/borough
* Optional WebSocket implementation for near-real-time updates
* Design user-friendly legend and control panel

---

Contributing:

Contributions welcome! Feel free to:

* Open issues
* Submit pull requests
* Improve rendering, detection algorithms, or UI/UX

---

License:

MIT License © 2025 — see `LICENSE` for details.
