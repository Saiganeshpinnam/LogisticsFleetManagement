import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../services/socket";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [newVehicle, setNewVehicle] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [assignSelections, setAssignSelections] = useState({}); // { [deliveryId]: { driverId, vehicleId } }

  useEffect(() => {
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
      await axios.post("/vehicles", { plateNumber: newVehicle, model: newVehicleModel });
      setNewVehicle("");
      setNewVehicleModel("");
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
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Vehicle Form */}
        <form onSubmit={addVehicle} className="mb-6 bg-white p-4 rounded shadow transition-all duration-300 hover:shadow-md">
          <h3 className="font-semibold mb-2">Add Vehicle</h3>
          <div className="grid grid-cols-3 gap-2 items-center">
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
          <table className="w-full border">
            <thead className="bg-blue-100">
              <tr>
                <th>ID</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Product</th>
                <th>Status</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="text-center border-t hover:bg-blue-50 transition-colors">
                  <td>{d.id}</td>
                  <td>{d.pickupAddress}</td>
                  <td>{d.dropAddress}</td>
                  <td>
                    {d.productUrl ? (
                      <div className="flex items-center gap-2 justify-center">
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
                  <td>{d.status}</td>
                  <td>
                    {d.driverId && d.vehicleId ? (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm animate-pulse">Assigned</span>
                    ) : (
                      <div className="flex gap-2 items-center justify-center">
                        <select
                          className="border p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          value={assignSelections[d.id]?.driverId || ""}
                          onChange={(e) => setAssignSelections((prev) => ({
                            ...prev,
                            [d.id]: { ...(prev[d.id]||{}), driverId: e.target.value },
                          }))}
                          disabled={!!(d.driverId && d.vehicleId)}
                        >
                          <option value="">Driver</option>
                          {drivers.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                        <select
                          className="border p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          value={assignSelections[d.id]?.vehicleId || ""}
                          onChange={(e) => setAssignSelections((prev) => ({
                            ...prev,
                            [d.id]: { ...(prev[d.id]||{}), vehicleId: e.target.value },
                          }))}
                          disabled={!!(d.driverId && d.vehicleId)}
                        >
                          <option value="">Vehicle</option>
                          {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>{v.plateNumber}{v.model ? ` - ${v.model}` : ""}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignDelivery(d.id)}
                          className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded disabled:opacity-50 transition-transform duration-200 hover:bg-blue-700 active:scale-95"
                          disabled={!!(d.driverId && d.vehicleId)}
                        >
                          {d.driverId && d.vehicleId ? 'Assigned' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
