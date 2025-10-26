import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AssignDelivery from "./pages/AssignDelivery";
import { getRole, isLoggedIn } from "./services/auth";
import Reports from "./pages/Reports";
import { isRoleAuthorized } from "./utils/roleUtils";

// ProtectedRoute component
function ProtectedRoute({ element, roles }) {
  if (!isLoggedIn()) {
    console.warn('🚨 Unauthorized access attempt: User not logged in');
    return <Navigate to="/" replace />; // Not logged in → redirect
  }

  const userRole = getRole();
  if (!userRole) {
    console.warn('🚨 Unauthorized access attempt: No role found in token');
    return <Navigate to="/" replace />; // Invalid token → redirect
  }

  if (!isRoleAuthorized(userRole, roles)) {
    console.warn(`🚨 Unauthorized access attempt: User role "${userRole}" not allowed for this route. Allowed roles: ${roles.join(', ')}`);
    return <Navigate to="/" replace />; // Unauthorized role → redirect
  }

  console.log(`✅ Authorized access: User role "${userRole}" accessing allowed route`);
  return element;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminDashboard />} roles={["admin"]} />}
        />
        <Route
          path="/driver"
          element={<ProtectedRoute element={<DriverDashboard />} roles={["driver"]} />}
        />
        <Route
          path="/customer"
          element={<ProtectedRoute element={<CustomerDashboard />} roles={["customer"]} />}
        />

        {/* Admin-only Assign Delivery page */}
        <Route
          path="/assign-delivery"
          element={<ProtectedRoute element={<AssignDelivery />} roles={["admin"]} />}
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={<ProtectedRoute element={<Reports />} roles={["admin"]} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
