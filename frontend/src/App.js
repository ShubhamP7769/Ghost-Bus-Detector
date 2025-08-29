import React, { useState } from "react";
import BusMap from "./BusMap";
import BusCharts from "./BusCharts";
import Alerts from "./Alerts";
import "./App.css";

function App() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="App">
      <button className="chart-toggle" onClick={() => setShowChart(!showChart)}>
        {showChart ? "Hide Chart" : "Show Chart"}
      </button>

      <Alerts />
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <BusMap />
        </div>
        {showChart && <BusCharts />}
      </div>
    </div>
  );
}

export default App;
