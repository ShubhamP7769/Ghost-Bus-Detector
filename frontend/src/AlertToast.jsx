import React, { useEffect } from "react";

export default function AlertToast({ buses }) {
  useEffect(() => {
    const ghosts = buses.filter(b => b.status === "Ghost");
    if (ghosts.length > 0) {
      alert(`⚠️ ${ghosts.length} Ghost buses detected!`);
    }
  }, [buses]);

  return null;
}
