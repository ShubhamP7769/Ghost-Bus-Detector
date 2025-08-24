Ghost Bus Detector

Overview

The Ghost Bus Detector is a real-time public transit monitoring system that identifies and visualizes ghost buses—buses that are reported to be active but are not actually running. This project utilizes live GTFS-Realtime data, React.js with Leaflet for mapping, and Python with FastAPI for backend services.

Features
* Real-time bus tracking on an interactive map
* Detection of ghost buses based on GTFS-Realtime data
* Visual indicators for active and inactive buses
* WebSocket integration for live data updates
* Backend API built with FastAPI
* Frontend UI developed using React.js and Leaflet

Installation:-

Frontend
1. Clone the repository:
   ```bash
   git clone https://github.com/ShubhamP7769/Ghost-Bus-Detector.git
   cd Ghost-Bus-Detector/frontend-new
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

Backend
1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```
2. Set up a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   
Usage

* Access the frontend application at `http://localhost:3000`.
* The map will display real-time bus locations and highlight ghost buses.
* The backend API provides endpoints for fetching GTFS-Realtime data and processing it to detect ghost buses.

Contributing

Feel free to fork the repository, submit issues, and create pull requests. Contributions are welcome to improve the detection algorithms, enhance the user interface, or add new features.

License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
