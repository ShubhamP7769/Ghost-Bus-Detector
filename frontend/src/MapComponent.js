// MapComponent.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import BusTrendChart from "./BusTrendChart";
import "leaflet/dist/leaflet.css";

const STATUS_COLOR = {
  normal: "green",
  ghost: "red",
  anomaly: "orange",
};

export default function MapComponent() {
  const [buses, setBuses] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchBuses = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/buses");
      const data = await res.json();
      // Ensure all timestamps are numbers
      const parsedData = data.map(bus => ({
        ...bus,
        timestamp: Number(bus.timestamp),
      }));
      setBuses(parsedData);
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  };

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000); 
    return () => clearInterval(interval);
  }, []);

  const countStatus = (status) => buses.filter((b) => b.status === status).length;

  // FIXED: Use a map to keep only the latest update per bus id and maintain ghosts
  const latestBusesMap = new Map();
  buses.forEach(bus => {
    const existing = latestBusesMap.get(bus.id);
    if (!existing) {
      latestBusesMap.set(bus.id, bus);
    } else {
      // Keep ghost if already ghost
      if (existing.status === "ghost") return;
      if (bus.timestamp > existing.timestamp) {
        latestBusesMap.set(bus.id, bus);
      }
    }
  });
  const latestBuses = Array.from(latestBusesMap.values());

  // Apply filter immediately
  const filteredBuses = latestBuses.filter(bus =>
    filterStatus === "all" ? true : bus.status === filterStatus
  );

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Chart Button */}
      <button
        style={{
          position: "absolute",
          top: 10,
          left: 50,
          zIndex: 1000,
          padding: "8px 12px",
          cursor: "pointer",
        }}
        onClick={() => setShowChart(!showChart)}
      >
        {showChart ? "Hide Chart" : "Show Chart"}
      </button>

      {/* Filter Buttons */}
      <div style={{
        position: "absolute",
        top: 10,
        right: 30,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.8)",
        padding: "5px",
        borderRadius: "5px",
        display: "flex",
        gap: "5px",
      }}>
        {["all", "normal", "ghost", "anomaly"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{ fontWeight: filterStatus === status ? "bold" : "normal" }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Floating Chart Panel */}
      {showChart && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            zIndex: 1000,
            width: 400,
            height: 250,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 10,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        >
          <BusTrendChart buses={buses} />
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {filteredBuses.map((bus) => (
          <CircleMarker
            key={bus.id + "_" + bus.timestamp} // ensure unique keys
            center={[bus.lat, bus.lon]}
            radius={6}
            color={STATUS_COLOR[bus.status]}
            fillOpacity={0.8}
          >
            <Tooltip>{`ID: ${bus.id}, Status: ${bus.status}`}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Bus Count Text */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "6px 10px",
          borderRadius: 6,
          zIndex: 1000,
        }}
      >
        Normal: {countStatus("normal")} | Ghost: {countStatus("ghost")} | Anomaly: {countStatus("anomaly")}
      </div>
    </div>
  );
}
