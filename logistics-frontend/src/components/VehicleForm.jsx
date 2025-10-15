import React, { useState } from 'react'
import api from '../services/api'

export default function VehicleForm({ onAdded }){
  const [form, setForm] = useState({ plate: '', model: '' })
  const submit = async (e) =>{
    e.preventDefault()
    await api.post('/vehicles', form)
    setForm({ plate: '', model: '' })
    onAdded && onAdded()
  }
  return (
    <form onSubmit={submit} className="space-y-2 mt-3">
      <input className="w-full p-2 border rounded" value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})} placeholder="Plate" />
      <input className="w-full p-2 border rounded" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Model" />
      <button className="px-3 py-2 rounded bg-primary text-white">Add Vehicle</button>
    </form>
  )
}
