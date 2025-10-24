import React, { useState, useEffect, useCallback } from "react";
import axios from "../services/api";
import socket from "../services/socket";
import Navbar from "../components/Navbar";
import MapTracker from "../components/MapTracker";
import EnhancedAddressAutocomplete from "../components/EnhancedAddressAutocomplete";
import { getUserId, getUser } from "../services/api";
import { calculateDistance, PRICING_CONFIG } from "../utils/pricing";

export default function CustomerDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });
  const [error, setError] = useState("");
  const [destination, setDestination] = useState(null); // [lat, lng]
  const [etaHours, setEtaHours] = useState(null);
  const [pickup, setPickup] = useState(null); // [lat, lng]
  const [requestForm, setRequestForm] = useState({ pickupAddress: "", dropAddress: "", productUrl: "", logisticType: "standard", vehicleType: "two_wheeler", logisticCategory: "goods_shifting" });
  const [user, setUser] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(1.0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);
  // Calculate total price based on selections (memoized to prevent unnecessary re-renders)
  const calculatePrice = useCallback((vehicleType, logisticCategory, distanceKm) => {
    const unitPrice = PRICING_CONFIG[vehicleType]?.[logisticCategory] || 0;
    return unitPrice * distanceKm;
  }, []);

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
    // Load user profile information
    const userInfo = getUser();
    if (userInfo) {
      setUser(userInfo);
    }

    loadDeliveries();
  }, []);

  // Calculate price whenever relevant fields change
  useEffect(() => {
    const price = calculatePrice(requestForm.vehicleType, requestForm.logisticCategory, estimatedDistance);
    setCalculatedPrice(price);
  }, [requestForm.vehicleType, requestForm.logisticCategory, estimatedDistance, calculatePrice]);

  // Geocode addresses and calculate distance when they change
  useEffect(() => {
    const geocodeAndCalculateDistance = async () => {
      if (!requestForm.pickupAddress || !requestForm.dropAddress) {
        setEstimatedDistance(1.0);
        setPickupCoordinates(null);
        setDropCoordinates(null);
        return;
      }

      setIsCalculatingDistance(true);

      try {
        const [pickupCoords, dropCoords] = await Promise.all([
          geocodeAddress(requestForm.pickupAddress),
          geocodeAddress(requestForm.dropAddress)
        ]);

        if (pickupCoords && dropCoords) {
          // Store the coordinates for later use when submitting
          setPickupCoordinates(pickupCoords);
          setDropCoordinates(dropCoords);
          
          const distance = calculateDistance(
            pickupCoords.latitude,
            pickupCoords.longitude,
            dropCoords.latitude,
            dropCoords.longitude
          );
          setEstimatedDistance(distance);
        } else {
          setEstimatedDistance(1.0);
          setPickupCoordinates(null);
          setDropCoordinates(null);
        }
      } catch (error) {
        console.warn('Distance calculation failed:', error);
        setEstimatedDistance(1.0);
        setPickupCoordinates(null);
        setDropCoordinates(null);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    // Debounce the geocoding to avoid too many API calls
    const timeoutId = setTimeout(geocodeAndCalculateDistance, 1000);
    return () => clearTimeout(timeoutId);
  }, [requestForm.pickupAddress, requestForm.dropAddress]);

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

  const handleCancel = async (deliveryId) => {
    const ok = window.confirm(`Cancel delivery request #${deliveryId}?`);
    if (!ok) return;
    try {
      await axios.delete(`/deliveries/${deliveryId}/cancel`);
      // Optimistic update for immediate UI feedback
      setDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
      if (selectedDelivery === deliveryId) setSelectedDelivery(null);
      // Ensure state is in sync with server
      await loadDeliveries();
    } catch (err) {
      console.error('Cancel delivery error:', err);
      setError(err.response?.data?.message || `Failed to cancel (${err.response?.status || ''})`);
    }
  };

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

  // Geocode pickup address when selection changes - now using stored coordinates
  useEffect(() => {
    if (!selectedDelivery) return;
    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d) return;

    // Use stored coordinates if available, fallback to geocoding
    if (d.pickupLatitude && d.pickupLongitude) {
      setPickup([parseFloat(d.pickupLatitude), parseFloat(d.pickupLongitude)]);
    } else if (d.pickupAddress) {
      // Fallback geocoding using Google Maps API (only if coordinates not stored)
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
          console.warn('Geocode failed', e);
          setPickup(null);
        }
      })();
      return () => { cancelled = true; };
    } else {
      setPickup(null);
    }
  }, [selectedDelivery, deliveries]);

  // Geocode drop address when selection changes - now using stored coordinates
  useEffect(() => {
    if (!selectedDelivery) return;
    const d = deliveries.find(x => x.id === selectedDelivery);
    if (!d) return;

    // Use stored coordinates if available, fallback to geocoding
    if (d.dropLatitude && d.dropLongitude) {
      setDestination([parseFloat(d.dropLatitude), parseFloat(d.dropLongitude)]);
    } else if (d.dropAddress) {
      // Fallback geocoding using Google Maps API (only if coordinates not stored)
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
          console.warn('Geocode failed', e);
          setDestination(null);
        }
      })();
      return () => { cancelled = true; };
    } else {
      setDestination(null);
    }
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

  const submitRequest = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { pickupAddress, dropAddress, productUrl, logisticType, vehicleType, logisticCategory } = requestForm;
      
      // Send the frontend-calculated coordinates and distance to ensure consistency
      const requestData = {
        pickupAddress,
        dropAddress,
        productUrl,
        logisticType,
        vehicleType,
        logisticCategory,
        // Include frontend-calculated values for consistency
        distanceKm: estimatedDistance,
        pickupLatitude: pickupCoordinates?.latitude,
        pickupLongitude: pickupCoordinates?.longitude,
        pickupFormattedAddress: pickupCoordinates?.formattedAddress,
        dropLatitude: dropCoordinates?.latitude,
        dropLongitude: dropCoordinates?.longitude,
        dropFormattedAddress: dropCoordinates?.formattedAddress
      };
      
      await axios.post('/deliveries/request', requestData);
      setRequestForm({ pickupAddress: "", dropAddress: "", productUrl: "", logisticType: "standard", vehicleType: "two_wheeler", logisticCategory: "goods_shifting" });
      setPickupCoordinates(null);
      setDropCoordinates(null);
      setEstimatedDistance(1.0);
      await loadDeliveries();
    } catch (err) {
      console.error('Request delivery error:', err);
      setError(err.response?.data?.message || `Failed to request delivery (${err.response?.status || ""})`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Customer Dashboard</h2>

        {/* User Profile Section */}
        {user && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              User Profile
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
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 animate-pulse">{error}</div>
        )}

        {/* Request Delivery Form */}
        <form onSubmit={submitRequest} className="mb-6 bg-white p-6 rounded-lg shadow transition-all duration-300 hover:shadow-md">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Request a Delivery</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Pickup Address</label>
              <EnhancedAddressAutocomplete
                value={requestForm.pickupAddress}
                onChange={(value) => {
                  setRequestForm(prevForm => ({
                    ...prevForm,
                    pickupAddress: value
                  }));
                }}
                placeholder="Enter pickup address (e.g., Andheri, Bandra, Whitefield, Delhi)"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Drop Address</label>
              <EnhancedAddressAutocomplete
                value={requestForm.dropAddress}
                onChange={(value) => {
                  setRequestForm(prevForm => ({
                    ...prevForm,
                    dropAddress: value
                  }));
                }}
                placeholder="Enter drop address (e.g., Indiranagar, Banjara Hills, Connaught Place, Chennai)"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Link (Optional)</label>
              <input
                type="url"
                value={requestForm.productUrl}
                onChange={(e) => setRequestForm({ ...requestForm, productUrl: e.target.value })}
                placeholder="Product link (Flipkart/Amazon/Myntra)"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
              <select
                value={requestForm.vehicleType}
                onChange={(e) => setRequestForm({ ...requestForm, vehicleType: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="two_wheeler">Two Wheeler</option>
                <option value="four_wheeler">Four Wheeler</option>
                <option value="six_wheeler">Six Wheeler</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Logistic Category</label>
              <select
                value={requestForm.logisticCategory}
                onChange={(e) => setRequestForm({ ...requestForm, logisticCategory: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="home_shifting">Home Shifting</option>
                <option value="goods_shifting">Goods Shifting</option>
                <option value="materials_shifting">Materials Shifting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estimated Distance</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={estimatedDistance}
                  readOnly
                  placeholder="Distance in km"
                  className={`flex-1 border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isCalculatingDistance ? 'bg-gray-100' : 'bg-white'}`}
                  required
                />
                <span className="text-sm text-gray-600">km</span>
                {isCalculatingDistance && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Distance is automatically calculated from pickup and drop addresses
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Distance:</span>
                <span className="text-lg font-semibold text-blue-600">{estimatedDistance} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Rate per km:</span>
                <span className="text-lg font-semibold text-purple-600">₹{PRICING_CONFIG[requestForm.vehicleType]?.[requestForm.logisticCategory] || 0}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Price:</span>
                <span className="text-xl font-bold text-green-600">₹{calculatedPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-md font-medium transition-all duration-200 hover:bg-green-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Request Delivery
            </button>
          </div>
        </form>

        {deliveries.length === 0 ? (
          <p className="text-gray-500">No deliveries assigned yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {deliveries.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDelivery(d.id)}
                className={`p-4 rounded-xl shadow cursor-pointer transition hover:shadow-lg hover:-translate-y-0.5 duration-200 ${
                  selectedDelivery === d.id
                    ? "border-2 border-blue-600"
                    : "border border-transparent"
                } bg-white`}
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Delivery #{d.id}</h3>
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
                        : d.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    } font-semibold transition-colors`}
                  >
                    {d.status === "on_route" ? "On Route" : d.status === "delivered" ? "Delivered" : d.status === "pending" ? "Assigned" : "Unassigned"}
                  </span>
                  {d.vehicleType && (
                    <>
                      <br />
                      <strong>Vehicle:</strong>{" "}
                      <span className="capitalize text-indigo-600 font-medium">
                        {d.vehicleType === "two_wheeler" ? "Two Wheeler" : d.vehicleType === "four_wheeler" ? "Four Wheeler" : "Six Wheeler"}
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
                <div className="mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancel(d.id); }}
                    disabled={d.status !== 'pending' && d.status !== 'unassigned'}
                    className={`px-3 py-1.5 text-sm rounded transition active:scale-95 ${
                      (d.status === 'pending' || d.status === 'unassigned')
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDelivery && (
          <div className="bg-white p-4 rounded-xl shadow transition-all duration-300 hover:shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Live Tracking for Delivery #{selectedDelivery}
            </h3>
            {etaHours !== null && destination && (
              <div className="mb-3 text-sm text-gray-700">
                <strong>Estimated time to arrive:</strong> {etaHours.toFixed(2)} hours
              </div>
            )}
            {/* MapTracker component shows driver moving in real-time */}
            <MapTracker deliveryId={selectedDelivery} driverLocation={driverLocation} destination={destination} pickup={pickup} />
          </div>
        )}
      </div>
    </div>
  );
}
