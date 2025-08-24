import L from 'leaflet';
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Text marker
const TextMarker = ({ text }) => {
  return L.divIcon({
    className: "",
    html: `<div style="font-size: 20px;">${text}</div>`
  });
};

// Overlay showing bus counts
const BusOverlay = ({ running, ghost }) => {
  const map = useMap();
  useEffect(() => {
    const div = L.DomUtil.create("div", "bus-overlay");
    div.style.position = "absolute";
    div.style.bottom = "10px";
    div.style.left = "10px";
    div.style.background = "transparent";
    div.style.fontSize = "16px";
    div.style.fontWeight = "bold";
    div.innerHTML = `🟢 Running: ${running} 🔴 Ghost: ${ghost}`;
    map.getContainer().appendChild(div);

    return () => div.remove();
  }, [running, ghost, map]);
  return null;
};

export default function BusMap() {
  const [buses, setBuses] = useState([]);
  const [counts, setCounts] = useState({ running_count: 0, ghost_count: 0 });
  const [positions, setPositions] = useState({});

  // Fetch buses every 2 seconds
  useEffect(() => {
    const fetchBuses = () => {
      axios.get("http://127.0.0.1:8000/buses")
        .then(res => {
          setBuses(res.data.buses);
          setCounts({
            running_count: res.data.running_count,
            ghost_count: res.data.ghost_count
          });

          setPositions(prev => {
            const updated = { ...prev };
            res.data.buses.forEach(bus => {
              if (!updated[bus.id]) {
                updated[bus.id] = { currentLat: bus.lat, currentLon: bus.lon, targetLat: bus.lat, targetLon: bus.lon };
              } else {
                updated[bus.id].targetLat = bus.lat;
                updated[bus.id].targetLon = bus.lon;
              }
            });
            return updated;
          });
        })
        .catch(err => console.error(err));
    };
    fetchBuses();
    const interval = setInterval(fetchBuses, 2000);
    return () => clearInterval(interval);
  }, []);

  // Smooth movement
  useEffect(() => {
    const anim = setInterval(() => {
      setPositions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          const bus = updated[id];
          bus.currentLat += (bus.targetLat - bus.currentLat) * 0.1;
          bus.currentLon += (bus.targetLon - bus.currentLon) * 0.1;
        });
        return updated;
      });
    }, 50);
    return () => clearInterval(anim);
  }, []);

  return (
    <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; CARTO'
      />

      {buses.map(bus => {
        const pos = positions[bus.id] || { currentLat: bus.lat, currentLon: bus.lon };
        return (
          <Marker
            key={bus.id}
            position={[pos.currentLat, pos.currentLon]}
            icon={TextMarker({ text: bus.status === "Ghost" ? "🔴" : "🟢" })}
          >
            <Popup>
              <b>Bus Number:</b> {bus.id} <br/>
              <b>Route:</b> {bus.route} <br/>
              <b>Status:</b> {bus.status} <br/>
              <b>Speed:</b> {bus.speed.toFixed(1)} km/h
            </Popup>
          </Marker>
        );
      })}

      <BusOverlay running={counts.running_count} ghost={counts.ghost_count} />
    </MapContainer>
  );
}
