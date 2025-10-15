import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function Register(){
  const [query] = useSearchParams()
  const presetRole = query.get('role') || 'customer'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: presetRole })
  const { register } = React.useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await register(form)
      const role = res.data.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'driver') navigate('/driver')
      else navigate('/customer')
    } catch (err) {
      console.error(err)
      alert('Registration failed')
    }
  }

  return (
    <motion.div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <h2 className="text-2xl font-bold mb-4">Create account</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="w-full p-3 rounded border" />
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full p-3 rounded border" />
        <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Password" className="w-full p-3 rounded border" />
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full p-3 rounded border">
          <option value="admin">Admin</option>
          <option value="driver">Driver</option>
          <option value="customer">Customer</option>
        </select>
        <button className="w-full py-3 rounded bg-primary text-white">Sign up</button>
      </form>
    </motion.div>
  )
}
