Ghost Bus Detector

About the Project

Ghost Bus Detector is a real-time bus tracking application designed to monitor MTA bus feeds and identify "ghost buses"—buses that appear on live transit maps but are no longer actively running. By analyzing live data, this tool helps detect inconsistencies and anomalies in bus tracking information, providing a clearer, more accurate visualization of bus locations for transit users or system operators.

This project combines a Python-based backend API that fetches and processes data from MTA GTFS-RT feeds with a React frontend that displays bus locations on an interactive map. It also uses Redis for data caching to improve the performance and responsiveness of the system.

As the first project, it represents an integration of real-time data processing, web development, and anomaly detection to solve a practical transportation problem.

Features:

*Real-time Bus Tracking: Continuously displays current locations of buses on an interactive map.
*Ghost Bus Detection: Flags buses that haven't updated their positions within a specified time, labeling them as ghost buses.
*Anomaly Detection: Identifies buses with unexpectedly fresh or irregular data updates.
*Interactive Frontend: Built with React and Leaflet for smooth mapping and user-friendly display.
*Efficient Backend: A FastAPI-based Python backend that handles data fetching, processing, and serving the API.
*Data Caching: Uses Redis to cache bus data and reduce latency.

Tech Stack:

Frontend: React, Leaflet.js
Backend: Python, FastAPI
Data Caching: Redis
Real-time Data Source: MTA GTFS-RT feeds
Additional Tools: Node.js, npm

Getting Started:

Prerequisites:

Before running the project, ensure you have the following installed on your system:
Node.js and npm (for frontend development)
Python 3 (for backend API)
Redis (for caching bus data)

Installation and Setup:

Clone the repository:
bash
git clone https://github.com/shubhamp7769/ghost-bus-detector.git
cd ghost-bus-detector

Setup Backend:

Navigate to the backend directory:
bash
cd backend
Install Python dependencies:
bash
pip install -r requirements.txt
Ensure Redis is running on your machine (default settings assumed).

Start the backend server:
bash
uvicorn main:app --reload
The backend API will be hosted at http://localhost:8000 by default.

Setup Frontend:

Open a new terminal window/tab and navigate to the frontend directory:
bash
cd frontend
Install Node.js dependencies:
bash
npm install

Start the React development server:
bash
npm start
The frontend will open in your default browser, typically at http://localhost:3000, showing the interactive bus map with real-time tracking and ghost bus detection.

Usage:

*Use the frontend map to view active buses and their locations.
*Ghost buses—those not updating their location timely—will be flagged clearly.
*The backend API is responsible for fetching and processing raw MTA data.

Contributing:
As this is the first version of the project, contributions, issues, and suggestions are welcome to improve or extend its functionality.

License:
This project is licensed under the MIT License. See the LICENSE file for more details.
