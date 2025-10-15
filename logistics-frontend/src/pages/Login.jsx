import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'

export default function Login(){
  const [form, setForm] = useState({ email: '', password: '' })
  const { login } = React.useContext(AuthContext)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await login(form)
      const role = res.data.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'driver') navigate('/driver')
      else navigate('/customer')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <motion.div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full p-3 rounded border" />
        <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Password" className="w-full p-3 rounded border" />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full py-3 rounded bg-accent text-white">Login</button>
      </form>
    </motion.div>
  )
}
