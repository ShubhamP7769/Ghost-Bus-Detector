export default function BusList({ buses }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h2 className="text-xl font-semibold mb-2">Bus List</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th className="p-2">Route</th>
            <th className="p-2">Speed (mph)</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus.id} className="text-center border-b">
              <td className="p-2">{bus.id}</td>
              <td className="p-2">{bus.route}</td>
              <td className="p-2">{bus.speed.toFixed(1)}</td>
              <td
                className={`p-2 font-bold ${
                  bus.status === "Ghost"
                    ? "text-red-500"
                    : bus.status.includes("Anomaly")
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                {bus.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
