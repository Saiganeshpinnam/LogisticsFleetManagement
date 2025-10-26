import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../services/socket";
import { getUser, getRole } from "../services/api";
import DriverAnalytics from "../components/DriverAnalytics";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../utils/roleUtils";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [newVehicle, setNewVehicle] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehicleCode, setNewVehicleCode] = useState("");
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [assignSelections, setAssignSelections] = useState({}); // { [deliveryId]: { driverId, vehicleId } }
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const navigate = useNavigate();

  useEffect(() => {
    // Validate user role - only admins should access this dashboard
    const userRole = getRole();
    const normalizedRole = normalizeRole(userRole);

    if (normalizedRole !== 'Admin') {
      console.warn(`🚨 Unauthorized access to AdminDashboard by role: ${userRole}`);
      navigate('/');
      return;
    }

    console.log('✅ AdminDashboard access authorized for admin user');

    // Load user profile information
    const userInfo = getUser();
    if (userInfo) {
      setUser(userInfo);
    }

    fetchData();
  }, [navigate]);

  // Filter deliveries based on search and filters
  const filteredDeliveries = deliveries.filter(delivery => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        delivery.id.toString().includes(query) ||
        (delivery.pickupAddress && delivery.pickupAddress.toLowerCase().includes(query)) ||
        (delivery.dropAddress && delivery.dropAddress.toLowerCase().includes(query)) ||
        (delivery.productTitle && delivery.productTitle.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "All Status") {
      const statusMap = {
        'Unassigned': 'unassigned',
        'Assigned': 'assigned',
        'On Route': 'on_route',
        'Delivered': 'delivered'
      };
      if (delivery.status !== statusMap[statusFilter]) return false;
    }

    // Category filter
    if (categoryFilter !== "All Categories") {
      const categoryMap = {
        'Goods Shifting': 'goods_shifting',
        'Home Shifting': 'home_shifting',
        'Materials Shifting': 'materials_shifting'
      };
      if (delivery.logisticCategory !== categoryMap[categoryFilter]) return false;
    }

    return true;
  });

  // Subscribe to admins room to get real-time updates when customers create requests or new assignments happen
  useEffect(() => {
    const handler = () => fetchData();
    socket.emit("subscribe-admins");
    socket.on("deliveries-updated", handler);
    return () => {
      socket.off("deliveries-updated", handler);
      socket.emit("unsubscribe-admins");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to drivers updates when new drivers register
  useEffect(() => {
    const driverHandler = () => {
      // Refresh drivers list when new drivers register
      axios.get("/users", { params: { role: "Driver" } })
        .then(res => setDrivers(res.data))
        .catch(err => console.error("Failed to refresh drivers:", err));
    };

    socket.on("drivers-updated", driverHandler);
    return () => {
      socket.off("drivers-updated", driverHandler);
    };
  }, []);

  const assignDelivery = async (deliveryId) => {
    setError("");
    try {
      const sel = assignSelections[deliveryId] || {};
      if (!sel.driverId || !sel.vehicleId) {
        setError("Please select both Driver and Vehicle to assign.");
        return;
      }
      await axios.put(`/deliveries/${deliveryId}/assign`, {
        driverId: sel.driverId,
        vehicleId: sel.vehicleId,
      });

      // No need to clear selections - they should remain visible after assignment
      fetchData();
    } catch (err) {
      console.error("Assign delivery error:", err);
      setError(err.response?.data?.message || `Failed to assign delivery (${err.response?.status || ""})`);
    }
  };

  const fetchData = async () => {
    setError("");
    try {
      const [v, d, drv] = await Promise.all([
        axios.get("/vehicles"),
        axios.get("/deliveries"),
        axios.get("/users", { params: { role: "Driver" } }),
      ]);
      setVehicles(v.data);
      setDeliveries(d.data);
      setDrivers(drv.data);

      // Initialize assignSelections with current assignments from database
      const initialSelections = {};
      d.data.forEach(delivery => {
        if (delivery.driverId && delivery.vehicleId) {
          initialSelections[delivery.id] = {
            driverId: delivery.driverId.toString(),
            vehicleId: delivery.vehicleId.toString()
          };
        }
      });
      setAssignSelections(initialSelections);
    } catch (err) {
      console.error("Admin fetchData error:", err);
      setError(err.response?.data?.message || `Failed to load data (${err.response?.status || ""})`);
    }
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/vehicles", { plateNumber: newVehicle, model: newVehicleModel, vehicleCode: newVehicleCode || undefined });
      setNewVehicle("");
      setNewVehicleModel("");
      setNewVehicleCode("");
      fetchData();
    } catch (err) {
      console.error("Add vehicle error:", err);
      setError(err.response?.data?.message || `Failed to add vehicle (${err.response?.status || ""})`);
    }
  };

  // Removed createDelivery and deleteDelivery per new flow

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          Admin Dashboard
        </h2>

        {/* User Profile Section */}
        {user && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Admin Profile
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
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Driver Analytics Section */}
        <DriverAnalytics />

        {/* Vehicle Form */}
        <form onSubmit={addVehicle} className="mb-6 bg-white p-4 rounded shadow transition-all duration-300 hover:shadow-md">
          <h3 className="font-semibold mb-2">Add Vehicle</h3>
          <div className="grid grid-cols-4 gap-2 items-center">
            <input
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value)}
              placeholder="Plate Number"
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <input
              value={newVehicleModel}
              onChange={(e) => setNewVehicleModel(e.target.value)}
              placeholder="Model (optional)"
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={newVehicleCode}
              onChange={(e) => setNewVehicleCode(e.target.value)}
              placeholder="Vehicle ID (optional)"
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded transition-transform duration-200 hover:bg-blue-700 active:scale-95">
              Add
            </button>
          </div>
          <div className="mt-3">
            <label className="text-sm text-gray-600">Existing Vehicles</label>
            <select className="mt-1 w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber}{v.model ? ` - ${v.model}` : ""}{v.vehicleCode ? ` (${v.vehicleCode})` : ""}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Deliveries List - Enhanced Real-World Styling */}
        <div className="mt-8 bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">📦 All Deliveries</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Total: {deliveries.length} deliveries
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Vehicles: {vehicles.length} available
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Drivers: {drivers.length} active
                </span>
                {(searchQuery || statusFilter !== "All Status" || categoryFilter !== "All Categories") && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Showing: {filteredDeliveries.length} filtered
                  </span>
                )}
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option>All Status</option>
                <option>Unassigned</option>
                <option>Assigned</option>
                <option>On Route</option>
                <option>Delivered</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option>All Categories</option>
                <option>Goods Shifting</option>
                <option>Home Shifting</option>
                <option>Materials Shifting</option>
              </select>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Deliveries</p>
                  <p className="text-2xl font-bold text-blue-900">{deliveries.length}</p>
                </div>
                <div className="p-2 bg-blue-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Available Vehicles</p>
                  <p className="text-2xl font-bold text-green-900">{vehicles.length}</p>
                </div>
                <div className="p-2 bg-green-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Active Drivers</p>
                  <p className="text-2xl font-bold text-purple-900">{drivers.length}</p>
                </div>
                <div className="p-2 bg-purple-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">On Route</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {deliveries.filter(d => d.status === 'on_route').length}
                  </p>
                </div>
                <div className="p-2 bg-orange-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {deliveries.length === 0 ? 'No deliveries yet' : 'No deliveries match your filters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {deliveries.length === 0
                  ? 'Customer requests will appear here once they create delivery orders.'
                  : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                }
              </p>
              {(searchQuery || statusFilter !== "All Status" || categoryFilter !== "All Categories") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All Status");
                    setCategoryFilter("All Categories");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => {
                    // Optional: Add click to expand functionality later
                  }}
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 group-hover:from-blue-700 group-hover:to-blue-800 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">#{delivery.id}</span>
                        {delivery.productImage && (
                          <img
                            src={delivery.productImage}
                            alt={delivery.productTitle || 'Product'}
                            className="w-8 h-8 object-cover rounded-lg border-2 border-white shadow-sm"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                          delivery.status === 'unassigned' ? 'bg-gray-100 text-gray-800' :
                          delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          delivery.status === 'on_route' ? 'bg-orange-100 text-orange-800' :
                          delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status === 'on_route' ? '🚚 On Route' :
                           delivery.status === 'delivered' ? '✅ Delivered' :
                           delivery.status === 'assigned' ? '📋 Assigned' :
                           delivery.status === 'pending' ? '⏳ Pending' :
                           delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-4 group-hover:bg-gray-50 transition-colors duration-300">
                    {/* Route Information */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                            From: {delivery.pickupFormattedAddress || delivery.pickupAddress}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-500">Pickup Location</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors duration-300">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                            To: {delivery.dropFormattedAddress || delivery.dropAddress}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-500">Drop Location</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle Type</p>
                        <div className="flex items-center gap-1">
                          {delivery.vehicleType === "two_wheeler" ? "🏍️" : delivery.vehicleType === "four_wheeler" ? "🚗" : "🚛"}
                          <span className="text-sm font-medium text-gray-900">
                            {delivery.vehicleType === "two_wheeler" ? "Bike" : delivery.vehicleType === "four_wheeler" ? "Car" : "Truck"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {delivery.logisticCategory === "home_shifting" ? "🏠 Home" :
                           delivery.logisticCategory === "goods_shifting" ? "📦 Goods" :
                           delivery.logisticCategory === "materials_shifting" ? "🏗️ Materials" : "Other"}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Distance</p>
                        <span className="text-sm font-medium text-gray-900">
                          {delivery.distanceKm ? `${parseFloat(delivery.distanceKm).toFixed(1)} km` : '—'}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Price</p>
                        <span className="text-sm font-bold text-green-600">
                          {delivery.totalPrice ? `₹${parseFloat(delivery.totalPrice).toFixed(2)}` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Product Information */}
                    {delivery.productUrl && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            {delivery.productImage ? (
                              <img src={delivery.productImage} alt={delivery.productTitle || 'Product'} className="w-10 h-10 object-cover rounded-lg" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={delivery.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium truncate block"
                            >
                              {delivery.productTitle || 'View Product'}
                            </a>
                            {delivery.productPrice && (
                              <p className="text-xs text-gray-500">{delivery.productPrice}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignment Controls */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          value={assignSelections[delivery.id]?.vehicleId || ""}
                          onChange={(e) => setAssignSelections((prev) => ({
                            ...prev,
                            [delivery.id]: { ...(prev[delivery.id]||{}), vehicleId: e.target.value },
                          }))}
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.plateNumber}{v.model ? ` (${v.model})` : ""}
                            </option>
                          ))}
                        </select>

                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          value={assignSelections[delivery.id]?.driverId || ""}
                          onChange={(e) => setAssignSelections((prev) => ({
                            ...prev,
                            [delivery.id]: { ...(prev[delivery.id]||{}), driverId: e.target.value },
                          }))}
                        >
                          <option value="">Select Driver</option>
                          {drivers.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {delivery.driverId && delivery.vehicleId ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                              </svg>
                              Ready to assign
                            </span>
                          ) : (
                            'Select driver & vehicle'
                          )}
                        </div>

                        <button
                          onClick={() => assignDelivery(delivery.id)}
                          disabled={delivery.status !== 'unassigned' || !(assignSelections[delivery.id]?.driverId && assignSelections[delivery.id]?.vehicleId)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            delivery.status !== 'unassigned' || !(assignSelections[delivery.id]?.driverId && assignSelections[delivery.id]?.vehicleId)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md'
                          }`}
                        >
                          {delivery.driverId && delivery.vehicleId ? '🚀 Assign Now' : 'Select First'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredDeliveries.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing 1-{Math.min(filteredDeliveries.length, 12)} of {filteredDeliveries.length} filtered deliveries
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">1</span>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
