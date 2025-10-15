import { useEffect, useState } from "react";
import axios from "../services/api";
import socket from "../services/socket";
import Navbar from "../components/Navbar";

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeIntervals, setActiveIntervals] = useState({}); // Track intervals per delivery

  useEffect(() => {
    loadDeliveries();

    // Cleanup all intervals on unmount
    return () => {
      Object.values(activeIntervals).forEach(clearInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDeliveries = async () => {
    try {
      const res = await axios.get("/deliveries/me");
      setDeliveries(res.data);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
    }
  };

  const startRoute = (deliveryId) => {
    if (activeIntervals[deliveryId]) {
      alert("Route already started for this delivery!");
      return;
    }

    let lat = 17.385; // Default starting location (Hyderabad)
    let lng = 78.4867;

    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;

      // Emit location to backend via Socket.io
      socket.emit("driver-location", { deliveryId, lat, lng });
    }, 3000);

    setActiveIntervals((prev) => ({ ...prev, [deliveryId]: interval }));
    alert("🚀 GPS sharing started for delivery #" + deliveryId);
  };

  const stopRoute = (deliveryId) => {
    if (activeIntervals[deliveryId]) {
      clearInterval(activeIntervals[deliveryId]);
      setActiveIntervals((prev) => {
        const copy = { ...prev };
        delete copy[deliveryId];
        return copy;
      });
      alert("🛑 GPS sharing stopped for delivery #" + deliveryId);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/deliveries/${id}/status`, { status });
      loadDeliveries();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Driver Dashboard</h2>

        {deliveries.length === 0 ? (
          <p className="text-gray-500">No deliveries assigned yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
                <h3 className="font-semibold text-xl text-gray-800 mb-2">Delivery #{d.id}</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Pickup:</strong> {d.pickup} <br />
                  <strong>Drop:</strong> {d.drop} <br />
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      d.status === "Delivered"
                        ? "text-green-600"
                        : d.status === "On Route"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    } font-semibold`}
                  >
                    {d.status}
                  </span>
                </p>

                <div className="flex gap-3 mt-4 flex-wrap">
                  {!activeIntervals[d.id] ? (
                    <button
                      onClick={() => startRoute(d.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Start Route
                    </button>
                  ) : (
                    <button
                      onClick={() => stopRoute(d.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Stop Route
                    </button>
                  )}

                  <button
                    onClick={() => updateStatus(d.id, "On Route")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    On Route
                  </button>
                  <button
                    onClick={() => updateStatus(d.id, "Delivered")}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
