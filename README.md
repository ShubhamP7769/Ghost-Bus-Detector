# Ghost Bus Detector

## About the Project

This project is a real-time bus tracking application that monitors MTA bus feeds to identify "ghost buses" – buses that appear on live maps but aren't actually running. It features a React-based frontend that displays bus locations on a map, and a Python backend that fetches and processes the data.

## Features

* **Real-time Bus Tracking:** Displays the current location of buses on an interactive map.
* **Ghost Bus Detection:** Identifies and flags buses that haven't updated their location in a set amount of time.
* **Anomaly Detection:** Flags buses with unusually fresh data as potential anomalies.
* **Frontend Interface:** A user-friendly map interface built with React and Leaflet.
* **Backend API:** A FastAPI backend that serves processed bus data from MTA GTFS-RT feeds.
* **Data Caching:** Uses Redis to cache bus data and improve performance.

## Getting Started

### Prerequisites

* Node.js and npm
* Python 3
* Redis

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shubhamp7769/ghost-bus-detector.git](https://github.com/shubhamp7769/ghost-bus-detector.git)
    ```
2.  **Backend Setup:**
    * Navigate to the `backend` directory.
    * Install Python dependencies: `pip install -r requirements.txt`
    * Start the backend server: `uvicorn main:app --reload`
3.  **Frontend Setup:**
    * Navigate to the `frontend` directory.
    * Install Node.js dependencies: `npm install`
    * Start the frontend development server: `npm start`

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
