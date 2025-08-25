import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const BusInfoPanel = ({ bus, onClose }) => {
  if (!bus) return null;
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '250px',
      background: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      boxShadow: '0 1px 5px rgba(0,0,0,0.4)'
    }}>
      <button 
        onClick={onClose} 
        style={{ float: 'right', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
      >
        ✖
      </button>
      <h3>Bus Details</h3>
      <p><b>Bus ID:</b> {bus.id}</p>
      <p><b>Route:</b> {bus.route}</p>
      <p><b>Status:</b> {bus.status}</p>
      <p><b>Speed:</b> {bus.speed ? bus.speed.toFixed(1) : 'N/A'} mph</p>
    </div>
  );
};

export default function BusMap() {
  const [buses, setBuses] = useState([]);
  const [counts, setCounts] = useState({ running_count: 0, ghost_count: 0 });
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    const fetchBuses = () => {
      axios.get("http://127.0.0.1:8000/buses")
        .then(res => {
          setBuses(res.data.buses);
          setCounts({
            running_count: res.data.running_count,
            ghost_count: res.data.ghost_count
          });
        })
        .catch(err => console.error(err));
    };
    fetchBuses();
    const interval = setInterval(fetchBuses, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <MapContainer center={[40.7128, -74.0060]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; CARTO'
        />

        {buses.map(bus => (
          <CircleMarker
            key={bus.id}
            center={[bus.lat, bus.lon]}
            radius={6}
            color={bus.status === "Ghost" ? "red" : "green"}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => setSelectedBus(bus),
            }}
          >
            <Tooltip>Bus ID: {bus.id}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <BusInfoPanel bus={selectedBus} onClose={() => setSelectedBus(null)} />

      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "10px",
        zIndex: 1000,
        background: "white",
        padding: "5px 10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        boxShadow: "0 1px 5px rgba(0,0,0,0.4)"
      }}>
        🟢 Running: {counts.running_count} 🔴 Ghost: {counts.ghost_count}
      </div>
    </div>
  );
}
