import React, { useEffect, useState, useContext } from 'react'
import MapTracker from './MapTracker'
import { socket } from '../services/socket'
import { AuthContext } from '../context/AuthContext'

export default function DriverDashboard(){
  const { user } = useContext(AuthContext)
  const [assigned, setAssigned] = useState(null)

  useEffect(()=>{
    socket.auth = { token: null }
    socket.connect()
    socket.emit('join', { role: 'driver', id: user?.id })

    socket.on('assignment', (data)=> setAssigned(data))

    return ()=>{
      socket.disconnect()
    }
  }, [user])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Your Assignment</h3>
        {assigned ? (
          <div className="mt-3">
            <div className="p-3 rounded border">Delivery: {assigned.title}</div>
            <div className="mt-2">Pickup: {assigned.pickup}</div>
            <div>Drop: {assigned.drop}</div>
          </div>
        ) : <div className="mt-3 text-slate-500">No assignment yet</div>}
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-bold">Share Live Location</h3>
        <p className="text-sm text-slate-600">Map will broadcast GPS updates to the server every 5s (simulated or real if allowed).</p>
        <div className="h-80 mt-3 rounded overflow-hidden"><MapTracker shareLocation /></div>
      </div>
    </div>
  )
}
