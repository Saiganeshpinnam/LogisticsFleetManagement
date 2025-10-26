import { Link, useNavigate } from "react-router-dom";
import { getRole} from "../services/auth";

import { removeToken } from "../services/api";


export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    removeToken();
    navigate("/"); // redirect to login
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / App Name */}
          <div className="flex-shrink-0 font-bold text-xl">
            Logistics Tracker
          </div>

          {/* Links */}
          <div className="hidden md:flex space-x-6">
            {role === "admin" && <Link to="/admin" className="hover:underline">Dashboard</Link>}
            {role === "driver" && <Link to="/driver" className="hover:underline">Dashboard</Link>}
            {role === "customer" && <Link to="/customer" className="hover:underline">Dashboard</Link>}
          </div>

          {/* User / Logout */}
          <div className="flex items-center space-x-4">
            {role && <span className="font-medium capitalize">{role}</span>}
            {role && (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
