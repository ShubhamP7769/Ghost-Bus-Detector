const API_BASE = "http://localhost:8000";

export async function fetchBuses() {
  const res = await fetch(`${API_BASE}/buses`);
  return await res.json();
}

export function connectWebSocket(onMessage) {
  const ws = new WebSocket("ws://localhost:8000/ws/buses");
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  return ws;
}
