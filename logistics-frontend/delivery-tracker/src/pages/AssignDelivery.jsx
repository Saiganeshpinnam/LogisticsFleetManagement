import { useState, useEffect } from "react";
import axios, { getToken } from "../services/api";

export default function AssignDelivery() {
  const [form, setForm] = useState({
    pickupAddress: "",
    dropAddress: "",
    driverId: "",
    vehicleId: "",
    scheduledStart: "",
    scheduledEnd: "",
    customerId: "",
  });

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fetchData = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [driversRes, vehiclesRes, customersRes] = await Promise.all([
        axios.get("/users/drivers", { headers }),
        axios.get("/vehicles", { headers }),
        axios.get("/users/customers", { headers }),
      ]);

      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Make sure you are logged in as admin.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post("/deliveries", form, { headers });
      alert("Delivery assigned successfully!");
      setForm({
        pickupAddress: "",
        dropAddress: "",
        driverId: "",
        vehicleId: "",
        scheduledStart: "",
        scheduledEnd: "",
        customerId: "",
      });
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
          name="pickupAddress"
          placeholder="Pickup Address"
          value={form.pickupAddress}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="dropAddress"
          placeholder="Drop Address"
          value={form.dropAddress}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="driverId"
          value={form.driverId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
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
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} ({v.plate})
            </option>
          ))}
        </select>
        <select
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="scheduledStart"
          value={form.scheduledStart}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="scheduledEnd"
          value={form.scheduledEnd}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
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
