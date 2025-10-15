import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './components/AdminDashboard'
import DriverDashboard from './components/DriverDashboard'
import CustomerDashboard from './components/CustomerDashboard'
import Reports from './pages/Reports'
import { AuthContext } from './context/AuthContext'
import { motion } from 'framer-motion'

export default function App() {
  const { user, logout } = React.useContext(AuthContext)

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-slate-50 to-gray-100">
      <nav className="flex items-center justify-between p-4 shadow-md bg-white/60 backdrop-blur">
        <Link to="/" className="font-bold text-xl text-primary">Logistics Fleet</Link>
        <div className="flex gap-3">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md border">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-md bg-primary text-white">Sign up</Link>
            </>
          ) : (
            <>
              <span className="px-3 py-1 rounded-md bg-green-100">{user.role || 'User'}</span>
              <button onClick={logout} className="px-4 py-2 rounded-md border">Logout</button>
            </>
          )}
        </div>
      </nav>

      <main className="p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="/driver" element={<RequireAuth role="driver"><DriverDashboard /></RequireAuth>} />
            <Route path="/customer" element={<RequireAuth role="customer"><CustomerDashboard /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth role="admin"><Reports /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  )
}

function Home() {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <RoleCard title="Admin" desc="Manage vehicles, drivers and deliveries" to="/register?role=admin"/>
      <RoleCard title="Driver" desc="Receive assignments and share live location" to="/register?role=driver"/>
      <RoleCard title="Customer" desc="Book deliveries and track in real time" to="/register?role=customer"/>
    </div>
  )
}

function RoleCard({ title, desc, to }){
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="p-6 rounded-2xl shadow-lg bg-white">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
      <div className="mt-4 flex gap-2">
        <Link to={to} className="px-3 py-2 bg-primary text-white rounded">Sign up</Link>
        <Link to="/login" className="px-3 py-2 border rounded">Login</Link>
      </div>
    </motion.div>
  )
}

function RequireAuth({ children, role }){
  const { user, loading } = React.useContext(AuthContext)
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}
