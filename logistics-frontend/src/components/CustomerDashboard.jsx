import React, { useEffect, useState } from 'react'
import MapTracker from './MapTracker'
import api from '../services/api'

export default function CustomerDashboard(){
  const [deliveries, setDeliveries] = useState([])

  useEffect(()=>{ load() }, [])
  const load = async ()=>{
    const res = await api.get('/deliveries')
    setDeliveries(res.data)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Book Delivery</h3>
      </div>

      <div className="col-span-2 p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Track My Deliveries</h3>
        <div className="h-96 mt-3 rounded overflow-hidden"><MapTracker /></div>
        <ul className="mt-3">
          {deliveries.map(d=> <li key={d.id} className="p-2 border rounded mt-2">{d.title} — {d.status}</li>)}
        </ul>
      </div>
    </div>
  )
}
