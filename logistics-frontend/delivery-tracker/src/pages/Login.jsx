import { useState } from "react";
import api, { setToken } from "../services/api";
import { getRole } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "admin",
      label: "Admin",
      icon: "👑",
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      textColorSecondary: "text-blue-700",
      buttonColor: "bg-blue-600",
      buttonHoverColor: "hover:bg-blue-700",
      ringColor: "focus:ring-blue-500",
      description: "Manage deliveries, assign drivers, view reports"
    },
    {
      id: "driver",
      label: "Driver",
      icon: "🚛",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      textColorSecondary: "text-green-700",
      buttonColor: "bg-green-600",
      buttonHoverColor: "hover:bg-green-700",
      ringColor: "focus:ring-green-500",
      description: "View assigned deliveries and update status"
    },
    {
      id: "customer",
      label: "Customer",
      icon: "📦",
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      textColorSecondary: "text-purple-700",
      buttonColor: "bg-purple-600",
      buttonHoverColor: "hover:bg-purple-700",
      ringColor: "focus:ring-purple-500",
      description: "Request deliveries and track your orders"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Logistics Fleet</h1>
          <p className="text-blue-100">Choose your role to continue</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.bgColor} ${tab.textColorSecondary} border-b-2 border-blue-500`
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`${activeTab === tab.id ? "block" : "hidden"}`}
            >
              {/* Role Description */}
              <div className={`mb-6 p-4 ${tab.bgColor} rounded-lg border ${tab.borderColor}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{tab.icon}</span>
                  <h2 className={`text-xl font-semibold ${tab.textColor}`}>
                    {tab.label} Login
                  </h2>
                </div>
                <p className={`text-sm ${tab.textColorSecondary}`}>
                  {tab.description}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder={`Enter your ${tab.label.toLowerCase()} email`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${tab.ringColor} focus:border-blue-500 transition-colors`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${tab.ringColor} focus:border-blue-500 transition-colors`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${tab.buttonColor} text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : `${tab.buttonHoverColor} active:scale-95`
                  } focus:outline-none focus:ring-2 ${tab.ringColor} focus:ring-offset-2`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2`}></div>
                      Signing in...
                    </div>
                  ) : (
                    `Sign in as ${tab.label}`
                  )}
                </button>
              </form>

              {/* Role-specific help text */}
              <div className="mt-6 text-center">
                <p className={`text-sm ${tab.textColorSecondary}`}>
                  {tab.id === "admin" && "Need admin access? Contact your system administrator."}
                  {tab.id === "driver" && "Drivers can view assigned deliveries and update delivery status."}
                  {tab.id === "customer" && "Customers can request new deliveries and track existing orders."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
