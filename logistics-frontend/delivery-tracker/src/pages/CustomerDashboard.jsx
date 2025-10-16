import { useEffect, useState } from "react";
import axios from "../services/api";
import socket from "../services/socket";
import Navbar from "../components/Navbar";
import MapTracker from "../components/MapTracker";
import { getUserId } from "../services/api";

export default function CustomerDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });
  const [error, setError] = useState("");
  const [destination, setDestination] = useState(null); // [lat, lng]
  const [etaHours, setEtaHours] = useState(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  // Subscribe to user room to auto-refresh on new assignments
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    const handler = () => loadDeliveries();
    socket.emit("subscribe-user", userId);
    socket.on("deliveries-updated", handler);
    return () => {
      socket.off("deliveries-updated", handler);
      socket.emit("unsubscribe-user", userId);
    };
  }, []);

  useEffect(() => {
    if (!selectedDelivery) return;

    // Subscribe to driver location updates (used by MapTracker) and status updates for this delivery
    socket.on(`delivery-${selectedDelivery}`, (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });
    const statusHandler = (payload) => {
      // Update the status in local state when driver/admin updates it
      setDeliveries((prev) => prev.map(d => d.id === payload.id ? { ...d, status: payload.status } : d));
    };
    socket.emit("subscribe-delivery", selectedDelivery);
    socket.on("status-updated", statusHandler);

    return () => {
      socket.emit("unsubscribe-delivery", selectedDelivery);
      socket.off(`delivery-${selectedDelivery}`);
      socket.off("status-updated", statusHandler);
    };
  }, [selectedDelivery]);

  // Geocode drop address when selection changes
  useEffect(() => {
    if (!selectedDelivery) return;
    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d?.dropAddress) return;
    let cancelled = false;
    (async () => {
      try {
        // Simple geocode using Nominatim (public OSM). In production, use a proper geocoding service with rate limiting.
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d.dropAddress)}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setDestination([lat, lon]);
        }
      } catch (e) {
        // Non-fatal for UI
        console.warn('Geocode failed', e);
        setDestination(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDelivery, deliveries]);

  // Compute ETA whenever we have both driverLocation and destination
  useEffect(() => {
    if (!destination || !driverLocation?.lat || !driverLocation?.lng) {
      setEtaHours(null);
      return;
    }
    const R = 6371; // km
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(destination[0] - driverLocation.lat);
    const dLon = toRad(destination[1] - driverLocation.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(driverLocation.lat)) * Math.cos(toRad(destination[0])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const avgSpeedKmh = 35; // assumed average city speed
    const hours = distanceKm / avgSpeedKmh;
    setEtaHours(hours);
  }, [driverLocation, destination]);

  const loadDeliveries = async () => {
    try {
      const res = await axios.get("/deliveries/me"); // Customer's deliveries
      setDeliveries(res.data);
      if (res.data.length > 0) setSelectedDelivery(res.data[0].id);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
      setError(error.response?.data?.message || `Failed to load deliveries (${error.response?.status || ""})`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Customer Dashboard</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

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
                  <strong>Pickup:</strong> {d.pickupAddress} <br />
                  <strong>Drop:</strong> {d.dropAddress} <br />
                  <strong>Status:</strong>{" "}
                  <span
                    className={`$
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
              </div>
            ))}
          </div>
        )}

        {selectedDelivery && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Live Tracking for Delivery #{selectedDelivery}
            </h3>
            {etaHours !== null && destination && (
              <div className="mb-3 text-sm text-gray-700">
                <strong>Estimated time to arrive:</strong> {etaHours.toFixed(2)} hours
              </div>
            )}
            {/* MapTracker component shows driver moving in real-time */}
            <MapTracker deliveryId={selectedDelivery} driverLocation={driverLocation} destination={destination} />
          </div>
        )}
      </div>
    </div>
  );
}
