import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer", // Default role
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend API
      const res = await api.post("/auth/register", form);

      alert(res.data.message || "Registered successfully ✅");
      // Redirect to login page after success
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-96"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Create Account
        </h2>

        {/* Name */}
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Password */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Role Selection */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="Customer">Customer</option>
          <option value="Driver">Driver</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-semibold transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Link to Login */}
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
