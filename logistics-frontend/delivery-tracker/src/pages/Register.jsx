import { useState } from "react";
import axios from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/register", form);
      alert(res.data.message || "Registered successfully!");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-96"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Register
        </h2>
        <input
          name="name"
          placeholder="Full Name"
          className="w-full mb-3 p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded-md"
          onChange={handleChange}
          required
        />
        <select
          name="role"
          className="w-full mb-4 p-2 border rounded-md"
          onChange={handleChange}
          value={form.role}
        >
          <option value="customer">Customer</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
