import { useEffect, useState } from "react";
import axios from "../services/api";
import { getUserId } from "../services/api";
import socket from "../services/socket";
import Navbar from "../components/Navbar";
import MapTracker from "../components/MapTracker";

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeIntervals, setActiveIntervals] = useState({}); // Track intervals per delivery
  const [error, setError] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });
  const [destination, setDestination] = useState(null);
  const [etaHours, setEtaHours] = useState(null);

  useEffect(() => {
    loadDeliveries();

    // Cleanup all intervals on unmount
    return () => {
      Object.values(activeIntervals).forEach(clearInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to status changes for each assigned delivery
  useEffect(() => {
    if (!deliveries || deliveries.length === 0) return;
    const handler = (payload) => {
      setDeliveries((prev) => prev.map(d => d.id === payload.id ? { ...d, status: payload.status } : d));
    };
    // Join all delivery rooms and listen for status updates
    deliveries.forEach((d) => {
      socket.emit("subscribe-delivery", d.id);
    });
    socket.on("status-updated", handler);
    return () => {
      deliveries.forEach((d) => socket.emit("unsubscribe-delivery", d.id));
      socket.off("status-updated", handler);
    };
  }, [deliveries]);

  // Subscribe to user-specific socket room to auto-refresh when admin assigns deliveries
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    socket.emit("subscribe-user", userId);
    const handler = () => loadDeliveries();
    socket.on("deliveries-updated", handler);
    return () => {
      socket.off("deliveries-updated", handler);
      socket.emit("unsubscribe-user", userId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedDelivery) return;
    const locHandler = (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    };
    socket.emit("subscribe-delivery", selectedDelivery);
    socket.on(`delivery-${selectedDelivery}`, locHandler);
    return () => {
      socket.emit("unsubscribe-delivery", selectedDelivery);
      socket.off(`delivery-${selectedDelivery}`, locHandler);
    };
  }, [selectedDelivery]);

  useEffect(() => {
    if (!selectedDelivery) return;
    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d?.dropAddress) return;
    let cancelled = false;
    (async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d.dropAddress)}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setDestination([lat, lon]);
        }
      } catch (e) {
        setDestination(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDelivery, deliveries]);

  useEffect(() => {
    if (!destination || !driverLocation?.lat || !driverLocation?.lng) {
      setEtaHours(null);
      return;
    }
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(destination[0] - driverLocation.lat);
    const dLon = toRad(destination[1] - driverLocation.lng);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(driverLocation.lat)) * Math.cos(toRad(destination[0])) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    const avgSpeedKmh = 35;
    const hours = distanceKm / avgSpeedKmh;
    setEtaHours(hours);
  }, [driverLocation, destination]);

  const loadDeliveries = async () => {
    setError("");
    try {
      const res = await axios.get("/deliveries/me");
      setDeliveries(res.data);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
      setError(error.response?.data?.message || `Failed to load deliveries (${error.response?.status || ""})`);
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
    setError("");
    try {
      await axios.put(`/deliveries/${id}/status`, { status });
      loadDeliveries();
    } catch (error) {
      console.error("Failed to update status:", error);
      setError(error.response?.data?.message || `Failed to update status (${error.response?.status || ""})`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Driver Dashboard</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {deliveries.length === 0 ? (
          <p className="text-gray-500">No deliveries assigned yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.map((d) => (
              <div key={d.id} onClick={() => setSelectedDelivery(d.id)} className={`bg-white p-5 rounded-xl shadow hover:shadow-lg transition ${selectedDelivery===d.id? 'border-2 border-blue-600' : ''}`}>
                <h3 className="font-semibold text-xl text-gray-800 mb-2">Delivery #{d.id}</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Pickup:</strong> {d.pickupAddress} <br />
                  <strong>Drop:</strong> {d.dropAddress} <br />
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      d.status === "delivered"
                        ? "text-green-600"
                        : d.status === "on_route"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    } font-semibold`}
                  >
                    {d.status === "on_route" ? "On Route" : d.status === "delivered" ? "Delivered" : "Pending"}
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
                    onClick={() => updateStatus(d.id, "on_route")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Picked Up
                  </button>
                  <button
                    onClick={() => updateStatus(d.id, "delivered")}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                  >
                    Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedDelivery && (
        <div className="px-6 pb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Tracking for Delivery #{selectedDelivery}</h3>
            {etaHours !== null && destination && (
              <div className="mb-3 text-sm text-gray-700">
                <strong>Estimated time to arrive:</strong> {etaHours.toFixed(2)} hours
              </div>
            )}
            <MapTracker deliveryId={selectedDelivery} driverLocation={driverLocation} destination={destination} />
          </div>
        </div>
      )}
    </div>
  );
}
