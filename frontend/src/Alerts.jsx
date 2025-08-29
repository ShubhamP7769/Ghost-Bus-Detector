// Alerts.jsx
import React, { useEffect, useState } from "react";

export default function AlertToast() {
  const [alerts, setAlerts] = useState([]);

  // Fetch anomalies/alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/anomalies");
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []); // fallback to empty array
      } catch (err) {
        console.error("Error fetching anomalies:", err);
        setAlerts([]); // fallback to empty array
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 120000); // refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  if (!alerts || alerts.length === 0) return null; // no alerts, render nothing

  return (
    <div className="alert-toast-container">
      {alerts.map((alert, index) => (
        <div key={index} className="alert-toast">
          <strong>Anomaly Detected:</strong> {alert.message || "Unknown alert"}
        </div>
      ))}
    </div>
  );
}
