import { useEffect, useState } from "react";

export default function Alerts({ alerts }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[alerts.length - 1];
      setVisibleAlerts((prev) => [...prev, latest]);

      // Auto-remove after 5s
      setTimeout(() => {
        setVisibleAlerts((prev) => prev.slice(1));
      }, 5000);
    }
  }, [alerts]);

  return (
    <div className="fixed top-4 right-4 space-y-2">
      {visibleAlerts.map((alert, i) => (
        <div key={i} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          ⚠ {alert}
        </div>
      ))}
    </div>
  );
}
