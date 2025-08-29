import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BusCharts({ buses }) {
  const data = [
    {
      name: "Buses",
      Running: buses.filter((b) => b.status === "Running").length,
      Ghost: buses.filter((b) => b.status === "Ghost").length,
      Anomaly: buses.filter((b) => b.status === "Anomaly").length,
    },
  ];

  return (
    <div
      style={{
        width: 450,    // bigger width
        height: 300,   // bigger height
        position: "absolute",
        top: 51,       // aligned with filter
        left: 180,     // beside filter dropdown
        zIndex: 1000,
        background: "white",
        padding: "12px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Running" stroke="green" strokeWidth={3} />
          <Line type="monotone" dataKey="Ghost" stroke="red" strokeWidth={3} />
          <Line type="monotone" dataKey="Anomaly" stroke="orange" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
