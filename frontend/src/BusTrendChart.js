// BusTrendChart.js
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BusTrendChart({ buses }) {
  // Count buses by status
  const counts = {
    normal: buses.filter(b => b.status === "normal").length,
    ghost: buses.filter(b => b.status === "ghost").length,
    anomaly: buses.filter(b => b.status === "anomaly").length,
  };

  // Single data point (latest) for simplicity
  const data = [
    { name: "Now", Normal: counts.normal, Ghost: counts.ghost, Anomaly: counts.anomaly },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Normal" stroke="green" />
        <Line type="monotone" dataKey="Ghost" stroke="red" />
        <Line type="monotone" dataKey="Anomaly" stroke="orange" />
      </LineChart>
    </ResponsiveContainer>
  );
}
