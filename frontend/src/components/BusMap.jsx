import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function BusMap({ buses }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4 h-[400px]">
      <h2 className="text-xl font-semibold mb-2">Bus Map</h2>
      <MapContainer center={[40.7128, -74.006]} zoom={11} className="h-full w-full rounded-2xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {buses.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lon]}>
            <Popup>
              <b>Route:</b> {bus.route} <br />
              <b>Speed:</b> {bus.speed.toFixed(1)} mph <br />
              <b>Status:</b> {bus.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
