import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function BusMap() {
  const [buses, setBuses] = useState([]);
  const [filter, setFilter] = useState("All");
  const prevPositions = useRef({}); // store previous positions
  const targetPositions = useRef({}); // target positions from last fetch

  // Fetch buses every 2 minutes
  const fetchBuses = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/buses");
      const data = await response.json();

      data.buses.forEach((bus) => {
        targetPositions.current[bus.id] = { lat: bus.lat, lon: bus.lon };
        if (!prevPositions.current[bus.id]) {
          prevPositions.current[bus.id] = { lat: bus.lat, lon: bus.lon };
        }
      });

      setBuses(data.buses); // update statuses and speeds immediately
    } catch (err) {
      console.error("Failed to fetch bus data:", err);
    }
  };

  // Animate buses every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newBuses = buses.map((bus) => {
        const prev = prevPositions.current[bus.id];
        const target = targetPositions.current[bus.id];

        if (!prev || !target) return bus;

        const lat = prev.lat + (target.lat - prev.lat) * 0.05; // 5% step
        const lon = prev.lon + (target.lon - prev.lon) * 0.05;

        prevPositions.current[bus.id] = { lat, lon };
        return { ...bus, lat, lon };
      });

      setBuses(newBuses);
    }, 1000); // every second

    return () => clearInterval(interval);
  }, [buses]);

  // Initial fetch and 2-min updates
  useEffect(() => {
    fetchBuses();
    const fetchInterval = setInterval(fetchBuses, 120000); // 2 minutes
    return () => clearInterval(fetchInterval);
  }, []);

  // Count bus statuses
  const runningCount = buses.filter((b) => b.status === "Running").length;
  const ghostCount = buses.filter((b) => b.status === "Ghost").length;
  const anomalyCount = buses.filter((b) => b.status === "Anomaly").length;

  // Apply filter
  const filteredBuses =
    filter === "All"
      ? buses
      : buses.filter((b) =>
          filter === "Running"
            ? b.status === "Running"
            : filter === "Ghost"
            ? b.status === "Ghost"
            : b.status === "Anomaly"
        );

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Filter dropdown */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 50,
          background: "rgba(255,255,255,0.95)",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 1000,
          fontSize: "14px",
        }}
      >
        <label>
          Show:{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Running">Running</option>
            <option value="Ghost">Ghost</option>
            <option value="Anomaly">Anomaly</option>
          </select>
        </label>
      </div>

      {/* Bus counts */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(255,255,255,0.9)",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 1000,
          fontSize: "14px",
        }}
      >
        🟢 Running: {runningCount} <br />
        🔴 Ghost: {ghostCount} <br />
        🟠 Anomaly: {anomalyCount}
      </div>

      {/* Map */}
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />

        {filteredBuses.map((bus, index) => (
          <CircleMarker
            key={`${bus.feed}-${bus.id}-${index}`}
            center={[bus.lat, bus.lon]}
            radius={6}
            fillOpacity={1}
            color={
              bus.status === "Running"
                ? "green"
                : bus.status === "Ghost"
                ? "red"
                : "orange"
            }
          >
            <Tooltip>
              <div>
                <strong>Bus ID:</strong> {bus.id} <br />
                <strong>Feed:</strong> {bus.feed} <br />
                <strong>Status:</strong> {bus.status} <br />
                <strong>Speed:</strong>{" "}
                {bus.speed ? bus.speed.toFixed(1) + " mph" : "N/A"}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
