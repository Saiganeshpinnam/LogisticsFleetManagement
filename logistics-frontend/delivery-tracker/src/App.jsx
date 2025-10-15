import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AssignDelivery from "./pages/AssignDelivery";
import { getRole, isLoggedIn } from "./services/auth";

const ProtectedRoute = ({ element, roles }) => {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  const userRole = getRole();
  if (roles && !roles.includes(userRole)) return <Navigate to="/" replace />;
  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route
          path="/assign-delivery"
          element={<ProtectedRoute element={<AssignDelivery />} roles={["admin"]} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
