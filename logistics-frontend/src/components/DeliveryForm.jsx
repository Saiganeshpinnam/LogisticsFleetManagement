import React, { useState } from 'react'
import api from '../services/api'

export default function DeliveryForm({ onAdded }){
  const [form, setForm] = useState({ title: '', pickup: '', drop: '', vehicleId: '' })
  const submit = async (e) =>{
    e.preventDefault()
    await api.post('/deliveries', form)
    setForm({ title: '', pickup: '', drop: '', vehicleId: '' })
    onAdded && onAdded()
  }

  return (
    <form onSubmit={submit} className="space-y-2 mt-3">
      <input className="w-full p-2 border rounded" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" />
      <input className="w-full p-2 border rounded" value={form.pickup} onChange={e=>setForm({...form,pickup:e.target.value})} placeholder="Pickup Address" />
      <input className="w-full p-2 border rounded" value={form.drop} onChange={e=>setForm({...form,drop:e.target.value})} placeholder="Drop Address" />
      <input className="w-full p-2 border rounded" value={form.vehicleId} onChange={e=>setForm({...form,vehicleId:e.target.value})} placeholder="Vehicle ID (optional)" />
      <button className="px-3 py-2 rounded bg-accent text-white">Create Delivery</button>
    </form>
  )
}
