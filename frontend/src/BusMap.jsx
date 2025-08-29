import L from 'leaflet';
import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// --- STYLING OBJECTS ---
const styles = {
  container: { position: 'relative', height: '100vh' },
  map: { height: '100%', width: '100%' },
  busInfoPanel: {
    position: 'absolute', top: '10px', right: '10px', width: '250px',
    background: 'rgba(255, 255, 255, 0.9)', padding: '10px',
    borderRadius: '8px', zIndex: 1000,
  },
  statusOverlay: {
    position: 'absolute', bottom: '20px', left: '10px', zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.9)', padding: '10px 15px',
    borderRadius: '8px', fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', zIndex: 1100,
    background: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '8px',
  },
  closeButton: {
    float: 'right', border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: '16px',
  },
  filterPanel: {
    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, background: 'rgba(255, 255, 255, 0.9)', padding: '8px',
    borderRadius: '8px', display: 'flex', gap: '10px',
  },
  filterButton: {
    padding: '8px 12px', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontWeight: 'bold',
  }
};

// --- COMPONENTS ---

const BusMarkerIcon = ({ color }) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};


const BusInfoPanel = ({ bus, onClose }) => {
  if (!bus) return null;
  return (
    <div style={styles.busInfoPanel}>
      <button onClick={onClose} style={styles.closeButton}>✖</button>
      <h3>Bus Details</h3>
      <p><b>Bus ID:</b> {bus.id}</p>
      <p><b>Route:</b> {bus.route}</p>
      <p><b>Status:</b> {bus.status}</p>
      <p><b>Speed:</b> {bus.speed ? bus.speed.toFixed(1) : 'N/A'} mph</p>
    </div>
  );
};

const MapPanController = ({ position }) => {
    const map = useMap();
    React.useEffect(() => {
        if (position) {
            map.flyTo(position, 15);
        }
    }, [position, map]);
    return null;
};

// Filter controls component
const FilterControls = ({ filters, onFilterChange }) => {
    const getButtonStyle = (isActive) => ({
        ...styles.filterButton,
        backgroundColor: isActive ? '#337ab7' : '#f0f0f0',
        color: isActive ? 'white' : 'black',
    });

    return (
        <div style={styles.filterPanel}>
            <button
                style={getButtonStyle(filters.running)}
                onClick={() => onFilterChange('running', !filters.running)}
            >
                Running
            </button>
            <button
                style={getButtonStyle(filters.ghost)}
                onClick={() => onFilterChange('ghost', !filters.ghost)}
            >
                Ghost
            </button>
            <button
                style={getButtonStyle(filters.anomaly)}
                onClick={() => onFilterChange('anomaly', !filters.anomaly)}
            >
                Anomaly
            </button>
        </div>
    );
};

export default function BusMap() {
  const [buses, setBuses] = React.useState([]);
  const [positions, setPositions] = React.useState({});
  const [counts, setCounts] = React.useState({ running_count: 0, ghost_count: 0, anomaly_count: 0 });
  const [selectedBus, setSelectedBus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [panToPosition, setPanToPosition] = React.useState(null);
  const [filters, setFilters] = React.useState({ running: true, ghost: true, anomaly: true });

  React.useEffect(() => {
    const fetchData = () => {
      // REMOVED: Fetching from the /anomalies endpoint is no longer needed here.
      axios.get('http://127.0.0.1:8000/buses')
      .then(busRes => {
        if (busRes.data && Array.isArray(busRes.data.buses)) {
          const fetchedBuses = busRes.data.buses;
          const anomalyCount = fetchedBuses.filter(b => b.has_anomaly).length;
          setBuses(fetchedBuses);
          setCounts({
            running_count: busRes.data.running_count,
            ghost_count: busRes.data.ghost_count,
            anomaly_count: anomalyCount,
          });

          setPositions(prev => {
            const updated = {...prev};
            fetchedBuses.forEach(bus => {
              if (!updated[bus.id]) {
                updated[bus.id] = { currentLat: bus.lat, currentLon: bus.lon, targetLat: bus.lat, targetLon: bus.lon };
              } else {
                updated[bus.id].targetLat = bus.lat;
                updated[bus.id].targetLon = bus.lon;
              }
            });
            return updated;
          });
        }
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to load bus data. Please try again later.');
        setLoading(false);
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const animInterval = setInterval(() => {
      setPositions(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(id => {
          const pos = updated[id];
          pos.currentLat += (pos.targetLat - pos.currentLat) * 0.1;
          pos.currentLon += (pos.targetLon - pos.currentLon) * 0.1;
        });
        return updated;
      });
    }, 50);

    return () => clearInterval(animInterval);
  }, []);

  const getBusMarkerColor = (bus) => {
    if (bus.status === 'Ghost') return '#d9534f'; // Red
    if (bus.has_anomaly) return '#f0ad4e';     // Orange
    return '#5cb85c';                         // Green
  };
  
  const filteredBuses = buses.filter(bus => {
    const isRunning = bus.status === 'Running' && !bus.has_anomaly;
    const isGhost = bus.status === 'Ghost';
    const isAnomaly = bus.has_anomaly;

    if (filters.running && isRunning) return true;
    if (filters.ghost && isGhost) return true;
    if (filters.anomaly && isAnomaly) return true;

    return false;
  });

  if (loading) {
    return <div style={styles.loadingOverlay}>Loading Live Bus Data...</div>;
  }

  if (error) {
    return <div style={styles.loadingOverlay}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <MapContainer center={[40.7128, -74.006]} zoom={12} style={styles.map}>
        <MapPanController position={panToPosition} />
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; CARTO'
        />

        {filteredBuses
          .filter(bus => positions[bus.id])
          .map((bus) => {
            const pos = positions[bus.id];
            return (
              <Marker
                key={bus.id}
                position={[pos.currentLat, pos.currentLon]}
                icon={BusMarkerIcon({ color: getBusMarkerColor(bus) })}
                eventHandlers={{ click: () => { setSelectedBus(bus); setPanToPosition([bus.lat, bus.lon]); } }}
              >
                <Tooltip>Bus ID: {bus.id}</Tooltip>
              </Marker>
            );
        })}
      </MapContainer>

      <FilterControls filters={filters} onFilterChange={(key, value) => setFilters(prev => ({...prev, [key]: value}))} />
      {/* REMOVED: The AnomalyPanel is no longer rendered. */}
      <BusInfoPanel bus={selectedBus} onClose={() => setSelectedBus(null)} />

      <div style={styles.statusOverlay}>
        <span style={{ marginRight: '15px' }}>🟢 Running: {counts.running_count}</span>
        <span style={{ marginRight: '15px' }}>🔴 Ghost: {counts.ghost_count}</span>
        <span>🟠 Anomaly: {counts.anomaly_count}</span>
      </div>
    </div>
  );
}

