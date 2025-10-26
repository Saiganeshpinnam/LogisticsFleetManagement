import { useEffect, useState } from "react";
import axios from "../services/api";
import { getUserId, getUser, getRole } from "../services/api";
import socket from "../services/socket";
import Navbar from "../components/Navbar";
import MapTracker from "../components/MapTracker";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../utils/roleUtils";

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeIntervals, setActiveIntervals] = useState({}); // Track intervals per delivery
  const [error, setError] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });
  const [destination, setDestination] = useState(null);
  const [etaHours, setEtaHours] = useState(null);
  const [pickup, setPickup] = useState(null); // [lat, lng]
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate user role - only drivers should access this dashboard
    const userRole = getRole();
    const normalizedRole = normalizeRole(userRole);

    if (normalizedRole !== 'Driver') {
      console.warn(`🚨 Unauthorized access to DriverDashboard by role: ${userRole}`);
      navigate('/');
      return;
    }

    console.log('✅ DriverDashboard access authorized for driver user');

    // Load user profile information
    const userInfo = getUser();
    if (userInfo) {
      setUser(userInfo);
    }

    loadDeliveries();

    // Cleanup all intervals on unmount
    return () => {
      Object.values(activeIntervals).forEach(clearInterval);
    };
  }, [navigate, activeIntervals]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle selected delivery location updates
  useEffect(() => {
    if (!selectedDelivery) {
      setDriverLocation({ lat: 0, lng: 0 });
      return;
    }

    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d) return;

    // Start driver at pickup location
    if (d.pickupLatitude && d.pickupLongitude) {
      setDriverLocation({
        lat: parseFloat(d.pickupLatitude),
        lng: parseFloat(d.pickupLongitude)
      });
    } else {
      // Fallback to geocoding pickup address
      setDriverLocation({ lat: 0, lng: 0 }); // Will be updated by geocoding effect
    }
  }, [selectedDelivery, deliveries]);
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

  // Geocode address using backend API for consistency
  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(`/locations/geocode?address=${encodeURIComponent(address)}`);

      if (response.data && response.data.success) {
        return {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          formattedAddress: response.data.formattedAddress
        };
      }
      return null;
    } catch (error) {
      console.warn('Backend geocoding failed for:', address, error);
      return null;
    }
  };

  useEffect(() => {
    if (!selectedDelivery) return;
    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d?.pickupAddress) return;
    let cancelled = false;
    (async () => {
      try {
        const coords = await geocodeAddress(d.pickupAddress);
        if (!cancelled && coords) {
          setPickup([coords.latitude, coords.longitude]);
        } else {
          setPickup(null);
        }
      } catch (e) {
        setPickup(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDelivery, deliveries]);

  useEffect(() => {
    if (!selectedDelivery) return;
    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d?.dropAddress) return;
    let cancelled = false;
    (async () => {
      try {
        const coords = await geocodeAddress(d.dropAddress);
        if (!cancelled && coords) {
          setDestination([coords.latitude, coords.longitude]);
        } else {
          setDestination(null);
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

    // Get the delivery to find pickup coordinates
    const delivery = deliveries.find(d => d.id === deliveryId);
    let lat = 17.385; // Default starting location (Hyderabad)
    let lng = 78.4867;

    // Use pickup coordinates if available
    if (delivery && delivery.pickupLatitude && delivery.pickupLongitude) {
      lat = parseFloat(delivery.pickupLatitude);
      lng = parseFloat(delivery.pickupLongitude);
    }

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
      // Auto manage GPS sharing based on status
      if (status === 'on_route') {
        // Start route when picked up
        startRoute(id);
      } else if (status === 'delivered') {
        // Stop route when delivered
        stopRoute(id);
      }
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

        {/* User Profile Section */}
        {user && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Driver Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-800">{user.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

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
                {d.productUrl && (
                  <div className="flex gap-3 items-center mb-2">
                    {d.productImage && (
                      <img src={d.productImage} alt={d.productTitle || 'Product'} className="w-14 h-14 object-cover rounded" />
                    )}
                    <div className="text-sm">
                      <a href={d.productUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {d.productTitle || 'View product'}
                      </a>
                      {d.productPrice && <div className="text-gray-700">{d.productPrice}</div>}
                    </div>
                  </div>
                )}
                <p className="text-gray-700 mb-2">
                  <strong>Pickup:</strong> {d.pickupFormattedAddress || d.pickupAddress} <br />
                  <strong>Drop:</strong> {d.dropFormattedAddress || d.dropAddress} <br />
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      d.status === "delivered"
                        ? "text-green-600"
                        : d.status === "on_route"
                        ? "text-blue-600"
                        : d.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    } font-semibold`}
                  >
                    {d.status === "on_route" ? "On Route" : d.status === "delivered" ? "Delivered" : d.status === "pending" ? "Assigned" : "Unassigned"}
                  </span>
                  {d.vehicleType && (
                    <>
                      <br />
                      <strong>Vehicle:</strong>{" "}
                      <span className="text-lg">
                        {d.vehicleType === "two_wheeler" ? "🏍️ Bike" : d.vehicleType === "four_wheeler" ? "🚗 Car" : "🚛 Truck"}
                      </span>
                    </>
                  )}
                  {d.logisticCategory && (
                    <>
                      <br />
                      <strong>Category:</strong>{" "}
                      <span className="capitalize text-purple-600 font-medium">
                        {d.logisticCategory === "home_shifting" ? "Home Shifting" : d.logisticCategory === "goods_shifting" ? "Goods Shifting" : d.logisticCategory === "materials_shifting" ? "Materials Shifting" : "Other"}
                      </span>
                    </>
                  )}
                  {d.quantity && (
                    <>
                      <br />
                      <strong>Quantity:</strong> {d.quantity}
                    </>
                  )}
                  {d.distanceKm && (
                    <>
                      <br />
                      <strong>Distance:</strong> {parseFloat(d.distanceKm).toFixed(1)} km
                    </>
                  )}
                  {d.unitPrice && (
                    <>
                      <br />
                      <strong>Unit Price:</strong> ₹{parseFloat(d.unitPrice).toFixed(2)}
                    </>
                  )}
                  {d.totalPrice && (
                    <>
                      <br />
                      <strong>Total Price:</strong> ₹{parseFloat(d.totalPrice).toFixed(2)}
                    </>
                  )}
                </p>

                <div className="flex gap-3 mt-4 flex-wrap">
                  {d.status === 'delivered' ? null : (
                    <>
                      {d.status === 'on_route' ? (
                        <button
                          onClick={() => stopRoute(d.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                          Stop Route
                        </button>
                      ) : (
                        <button
                          onClick={() => startRoute(d.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                          Start Route
                        </button>
                      )}

                      {d.status !== 'delivered' && (
                        <button
                          onClick={() => updateStatus(d.id, 'on_route')}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                          Picked Up
                        </button>
                      )}

                      {d.status !== 'delivered' && (
                        <button
                          onClick={() => updateStatus(d.id, 'delivered')}
                          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                        >
                          Delivered
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedDelivery && (
        <div className="px-6 pb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Live Tracking for Delivery #{selectedDelivery}</h3>
            {(() => { const d = deliveries.find(x=>x.id===selectedDelivery); return d?.productUrl ? (
              <div className="flex items-center gap-3 mb-2">
                {d.productImage && <img src={d.productImage} alt={d.productTitle||'Product'} className="w-12 h-12 object-cover rounded"/>}
                <div className="text-sm">
                  <a href={d.productUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{d.productTitle || 'View product'}</a>
                  {d.productPrice && <div className="text-gray-700">{d.productPrice}</div>}
                </div>
              </div>
            ) : null; })()}
            {etaHours !== null && destination && (
              <div className="mb-3 text-sm text-gray-700">
                <strong>Estimated time to arrive:</strong> {etaHours.toFixed(2)} hours
              </div>
            )}
            <MapTracker deliveryId={selectedDelivery} driverLocation={driverLocation} destination={destination} pickup={pickup} vehicleType={(() => { const d = deliveries.find(x => x.id === selectedDelivery); return d?.vehicleType || 'four_wheeler'; })()} />
          </div>
        </div>
      )}
    </div>
  );
}
