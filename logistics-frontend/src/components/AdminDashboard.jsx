import React, { useEffect, useState } from 'react'
import VehicleForm from './VehicleForm'
import DeliveryForm from './DeliveryForm'
import MapTracker from './MapTracker'
import api from '../services/api'
import { motion } from 'framer-motion'

export default function AdminDashboard(){
  const [vehicles, setVehicles] = useState([])
  const [deliveries, setDeliveries] = useState([])

  useEffect(()=>{ fetchData() }, [])
  const fetchData = async ()=>{
    const v = await api.get('/vehicles')
    setVehicles(v.data)
    const d = await api.get('/deliveries')
    setDeliveries(d.data)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div className="col-span-1 p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Vehicles</h3>
        <VehicleForm onAdded={fetchData} />
        <ul className="mt-3 space-y-2">
          {vehicles.map(v=> <li key={v.id} className="p-2 border rounded">{v.plate} — {v.model}</li>)}
        </ul>
      </motion.div>

      <motion.div className="col-span-1 p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Create Delivery</h3>
        <DeliveryForm onAdded={fetchData} />
        <ul className="mt-3 space-y-2">
          {deliveries.map(d=> <li key={d.id} className="p-2 border rounded">{d.title} — {d.status}</li>)}
        </ul>
      </motion.div>

      <motion.div className="col-span-1 md:col-span-2 p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Live Tracker</h3>
        <div className="h-96 mt-3 rounded overflow-hidden">
          <MapTracker showControls />
        </div>
      </motion.div>
    </div>
  )
}
