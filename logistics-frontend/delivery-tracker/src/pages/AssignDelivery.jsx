import { useState, useEffect } from "react";
import axios from "../services/api";

export default function AssignDelivery() {
  const [form, setForm] = useState({
    driverId: "",
    vehicleId: "",
    deliveryItemId: "",
    customerId: "",
  });

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Fetch drivers, vehicles, customers
  const fetchData = async () => {
    try {
      const [driversRes, vehiclesRes, customersRes] = await Promise.all([
        axios.get("/users", { params: { role: "Driver" } }),
        axios.get("/vehicles"),
        axios.get("/users", { params: { role: "Customer" } }),
      ]);

      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch data. Make sure you are logged in as Admin and backend is running."
      );
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { driverId, vehicleId, deliveryItemId, customerId } = form;
      if (!driverId || !vehicleId || !deliveryItemId) {
        setError("Please provide driverId, vehicleId and deliveryItemId");
        return;
      }
      await axios.put(`/deliveries/${deliveryItemId}/assign`, { driverId, vehicleId, customerId: customerId || undefined });
      alert("Delivery assigned successfully!");

      setForm({ driverId: "", vehicleId: "", deliveryItemId: "", customerId: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error assigning delivery");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Assign Delivery</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="deliveryItemId"
          placeholder="Delivery Item ID"
          value={form.deliveryItemId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="driverId"
          value={form.driverId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.email})
            </option>
          ))}
        </select>

        <select
          name="vehicleId"
          value={form.vehicleId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} ({v.plateNumber})
            </option>
          ))}
        </select>

        <select
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Customer (optional)</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>

        {/* Removed customer and schedule fields for simplified assignment */}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Assign Delivery
        </button>
      </form>
    </div>
  );
}
