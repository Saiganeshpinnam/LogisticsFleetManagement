import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [newVehicle, setNewVehicle] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [delivery, setDelivery] = useState({
    pickupAddress: "",
    dropAddress: "",
    driverId: "",
    vehicleId: "",
    customerId: "",
  });
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError("");
    try {
      const [v, d, drv, cust] = await Promise.all([
        axios.get("/vehicles"),
        axios.get("/deliveries"),
        axios.get("/users", { params: { role: "Driver" } }),
        axios.get("/users", { params: { role: "Customer" } }),
      ]);
      setVehicles(v.data);
      setDeliveries(d.data);
      setDrivers(drv.data);
      setCustomers(cust.data);
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

  const createDelivery = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/deliveries", delivery);
      fetchData();
    } catch (err) {
      console.error("Create delivery error:", err);
      setError(err.response?.data?.message || `Failed to assign delivery (${err.response?.status || ""})`);
    }
  };

  const deleteDelivery = async (id) => {
    setError("");
    try {
      const ok = window.confirm(`Delete delivery #${id}? This cannot be undone.`);
      if (!ok) return;
      await axios.delete(`/deliveries/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete delivery error:", err);
      setError(err.response?.data?.message || `Failed to delete delivery (${err.response?.status || ""})`);
    }
  };

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
        <form onSubmit={addVehicle} className="mb-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Add Vehicle</h3>
          <div className="grid grid-cols-3 gap-2 items-center">
            <input
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value)}
              placeholder="Plate Number"
              className="border p-2 rounded"
              required
            />
            <input
              value={newVehicleModel}
              onChange={(e) => setNewVehicleModel(e.target.value)}
              placeholder="Model (optional)"
              className="border p-2 rounded"
            />
            <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded">
              Add
            </button>
          </div>
          <div className="mt-3">
            <label className="text-sm text-gray-600">Existing Vehicles</label>
            <select className="mt-1 w-full border p-2 rounded">
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber}{v.model ? ` - ${v.model}` : ""}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Delivery Form */}
        <form onSubmit={createDelivery} className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Delivery</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Pickup"
              onChange={(e) =>
                setDelivery({ ...delivery, pickupAddress: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Drop"
              onChange={(e) =>
                setDelivery({ ...delivery, dropAddress: e.target.value })
              }
              className="border p-2 rounded"
            />
            <select
              value={delivery.driverId}
              onChange={(e) => setDelivery({ ...delivery, driverId: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Driver</option>
              {drivers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <select
              value={delivery.vehicleId}
              onChange={(e) => setDelivery({ ...delivery, vehicleId: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber}{v.model ? ` - ${v.model}` : ""}
                </option>
              ))}
            </select>
            <select
              value={delivery.customerId}
              onChange={(e) => setDelivery({ ...delivery, customerId: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Customer</option>
              {customers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded">
            Assign Delivery
          </button>
        </form>

        {/* Deliveries List */}
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">All Deliveries</h3>
          <div className="text-sm text-gray-500 mb-2">Vehicles loaded: {vehicles.length}</div>
          <table className="w-full border">
            <thead className="bg-blue-100">
              <tr>
                <th>ID</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="text-center border-t">
                  <td>{d.id}</td>
                  <td>{d.pickupAddress}</td>
                  <td>{d.dropAddress}</td>
                  <td>{d.status}</td>
                  <td>
                    <button
                      onClick={() => deleteDelivery(d.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
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
