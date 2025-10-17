import { useState } from "react";
import api, { setToken } from "../services/api";
import { getRole } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      // Save JWT token
      setToken(res.data.token);

      // Decode role (lowercased)
      const role = getRole();

      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "driver") navigate("/driver");
      else if (role === "customer") navigate("/customer");
      else alert("Unknown role. Contact admin.");
    } catch (err) {
      console.error("Login error:", err);
      
      // More detailed error handling
      let errorMessage = "Login failed ❌";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.error("Server error details:", err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Cannot connect to server. Please check your internet connection.";
        console.error("Network error:", err.request);
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred";
        console.error("Unexpected error:", err.message);
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
