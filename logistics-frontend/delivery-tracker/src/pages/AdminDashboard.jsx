import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../services/socket";
import { getUser } from "../services/api";

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

  useEffect(() => {
    // Load user profile information
    const userInfo = getUser();
    if (userInfo) {
      setUser(userInfo);
    }

    fetchData();
  }, []);

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
                  {v.plateNumber}{v.model ? ` - ${v.model}` : ""}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Create Delivery form removed per new flow */}

        {/* Deliveries List */}
        <div className="mt-6 bg-white p-4 rounded shadow transition-all duration-300 hover:shadow-md">
          <h3 className="font-semibold mb-2">All Deliveries</h3>
          <div className="text-sm text-gray-500 mb-2">Vehicles loaded: {vehicles.length}</div>
          <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-[960px] md:min-w-full w-full border">
            <thead className="bg-blue-100">
              <tr>
                <th className="whitespace-nowrap px-2 py-2 text-left">ID</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">Pickup</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">Drop</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">Product</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">Status</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">deliveryItemId</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">DriverId</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">Vehicle</th>
                <th className="whitespace-nowrap px-2 py-2 text-left">Assign</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-t hover:bg-blue-50 transition-colors">
                  <td className="whitespace-nowrap px-2 py-2">{d.id}</td>
                  <td className="px-2 py-2">{d.pickupAddress}</td>
                  <td className="px-2 py-2">{d.dropAddress}</td>
                  <td>
                    {d.productUrl ? (
                      <div className="flex items-center gap-2">
                        {d.productImage && (
                          <img src={d.productImage} alt={d.productTitle || 'Product'} className="w-10 h-10 object-cover rounded" />
                        )}
                        <div className="text-left max-w-[220px] truncate">
                          <a className="text-blue-600 hover:underline" href={d.productUrl} target="_blank" rel="noreferrer">
                            {d.productTitle || 'View product'}
                          </a>
                          {d.productPrice && <div className="text-xs text-gray-700">{d.productPrice}</div>}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2">{d.status}</td>
                  <td className="whitespace-nowrap px-2 py-2">{d.id}</td>
                  <td className="px-2 py-2 overflow-visible">
                    <select
                      className="relative z-20 border p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-40 md:w-48 bg-white"
                      value={assignSelections[d.id]?.driverId || ""}
                      onChange={(e) => setAssignSelections((prev) => ({
                        ...prev,
                        [d.id]: { ...(prev[d.id]||{}), driverId: e.target.value },
                      }))}
                    >
                      <option value="">Driver</option>
                      {drivers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 overflow-visible">
                    <select
                      className="relative z-20 border p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-36 md:w-44 bg-white"
                      value={assignSelections[d.id]?.vehicleId || ""}
                      onChange={(e) => setAssignSelections((prev) => ({
                        ...prev,
                        [d.id]: { ...(prev[d.id]||{}), vehicleId: e.target.value },
                      }))}
                    >
                      <option value="">Vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.plateNumber}{v.model ? ` - ${v.model}` : ""}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {d.driverId && d.vehicleId ? (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm animate-pulse">Assigned</span>
                    ) : (
                      <button
                        onClick={() => assignDelivery(d.id)}
                        className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded disabled:opacity-50 transition-transform duration-200 hover:bg-blue-700 active:scale-95"
                        disabled={!!(d.driverId && d.vehicleId) || !(assignSelections[d.id]?.driverId && assignSelections[d.id]?.vehicleId)}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
