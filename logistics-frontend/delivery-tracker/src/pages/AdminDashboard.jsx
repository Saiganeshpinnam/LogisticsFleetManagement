import { useEffect, useState } from "react";
import axios from "../services/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [newVehicle, setNewVehicle] = useState("");
  const [delivery, setDelivery] = useState({
    pickup: "",
    drop: "",
    driverId: "",
    vehicleId: "",
    customerId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [v, d] = await Promise.all([
      axios.get("/vehicles"),
      axios.get("/deliveries"),
    ]);
    setVehicles(v.data);
    setDeliveries(d.data);
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    await axios.post("/vehicles", { number: newVehicle });
    setNewVehicle("");
    fetchData();
  };

  const createDelivery = async (e) => {
    e.preventDefault();
    await axios.post("/deliveries", delivery);
    fetchData();
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          Admin Dashboard
        </h2>

        {/* Vehicle Form */}
        <form onSubmit={addVehicle} className="mb-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Add Vehicle</h3>
          <div className="flex gap-2">
            <input
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value)}
              placeholder="Vehicle Number"
              className="border p-2 flex-1 rounded"
            />
            <button className="bg-blue-600 text-white px-4 rounded">
              Add
            </button>
          </div>
        </form>

        {/* Delivery Form */}
        <form onSubmit={createDelivery} className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Delivery</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Pickup"
              onChange={(e) =>
                setDelivery({ ...delivery, pickup: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Drop"
              onChange={(e) =>
                setDelivery({ ...delivery, drop: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Driver ID"
              onChange={(e) =>
                setDelivery({ ...delivery, driverId: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Vehicle ID"
              onChange={(e) =>
                setDelivery({ ...delivery, vehicleId: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              placeholder="Customer ID"
              onChange={(e) =>
                setDelivery({ ...delivery, customerId: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>
          <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded">
            Assign Delivery
          </button>
        </form>

        {/* Deliveries List */}
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">All Deliveries</h3>
          <table className="w-full border">
            <thead className="bg-blue-100">
              <tr>
                <th>ID</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="text-center border-t">
                  <td>{d.id}</td>
                  <td>{d.pickup}</td>
                  <td>{d.drop}</td>
                  <td>{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
