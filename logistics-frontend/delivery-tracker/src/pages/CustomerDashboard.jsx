import { useEffect, useState } from "react";
import axios from "../services/api";
import socket from "../services/socket";
import Navbar from "../components/Navbar";
import MapTracker from "../components/MapTracker";

export default function CustomerDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    if (!selectedDelivery) return;

    // Subscribe to driver location updates
    socket.on(`delivery-${selectedDelivery}`, (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.off(`delivery-${selectedDelivery}`);
    };
  }, [selectedDelivery]);

  const loadDeliveries = async () => {
    try {
      const res = await axios.get("/deliveries/me"); // Customer's deliveries
      setDeliveries(res.data);
      if (res.data.length > 0) setSelectedDelivery(res.data[0].id);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Customer Dashboard</h2>

        {deliveries.length === 0 ? (
          <p className="text-gray-500">No deliveries assigned yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {deliveries.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDelivery(d.id)}
                className={`p-4 rounded-xl shadow cursor-pointer transition hover:shadow-lg ${
                  selectedDelivery === d.id
                    ? "border-2 border-blue-600"
                    : "border border-transparent"
                } bg-white`}
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Delivery #{d.id}</h3>
                <p className="text-gray-700">
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
              </div>
            ))}
          </div>
        )}

        {selectedDelivery && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Live Tracking for Delivery #{selectedDelivery}
            </h3>
            {/* MapTracker component shows driver moving in real-time */}
            <MapTracker deliveryId={selectedDelivery} driverLocation={driverLocation} />
          </div>
        )}
      </div>
    </div>
  );
}
