import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BusTrends({ trendData }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4 h-[400px]">
      <h2 className="text-xl font-semibold mb-2">Bus Speed Trends</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <XAxis dataKey="time" tick={false} />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(trendData).slice(0, 5).map((busId) => (
            <Line
              key={busId}
              data={trendData[busId]}
              dataKey="speed"
              name={`Bus ${busId}`}
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
