import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BusMap() {
  const [buses, setBuses] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Fetch bus data every 2 minutes
  const fetchBuses = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/buses");
      const data = await response.json();
      const busList = data.buses || [];
      setBuses(busList);

      // Prepare chart data: counts by status over time
      const runningCount = busList.filter((b) => b.status === "Running").length;
      const ghostCount = busList.filter((b) => b.status === "Ghost").length;
      const anomalyCount = busList.filter((b) => b.status === "Anomaly").length;

      setChartData((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          Running: runningCount,
          Ghost: ghostCount,
          Anomaly: anomalyCount,
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
    }
  };

  useEffect(() => {
    fetchBuses(); // initial fetch
    const interval = setInterval(fetchBuses, 120000); // every 2 minutes
    return () => clearInterval(interval);
  }, []);

  // Count bus statuses
  const runningCount = buses.filter((b) => b.status === "Running").length;
  const ghostCount = buses.filter((b) => b.status === "Ghost").length;
  const anomalyCount = buses.filter((b) => b.status === "Anomaly").length;

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Bus counts and chart button */}
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
        🟢 Running: {runningCount} <br />
        🔴 Ghost: {ghostCount} <br />
        🟠 Anomaly: {anomalyCount} <br />
        <button
          style={{ marginTop: "5px", cursor: "pointer" }}
          onClick={() => setShowChart(!showChart)}
        >
          {showChart ? "Hide Chart" : "Show Chart"}
        </button>
      </div>

      {/* Chart */}
      {showChart && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 12,
            width: 700,
            height: 400,
            background: "rgba(255,255,255,0.95)",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="Running" stroke="green" />
              <Line type="monotone" dataKey="Ghost" stroke="red" />
              <Line type="monotone" dataKey="Anomaly" stroke="orange" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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

        {buses.map((bus, index) => (
          <CircleMarker
            key={`${bus.feed}-${bus.id}-${index}`} // unique key
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
