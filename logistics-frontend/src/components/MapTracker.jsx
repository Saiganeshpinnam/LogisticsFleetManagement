import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { socket } from '../services/socket'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default function MapTracker({ shareLocation = false, showControls = false }){
  const [positions, setPositions] = useState([])
  const [others, setOthers] = useState([])
  const watchRef = useRef(null)

  useEffect(()=>{
    socket.connect()
    socket.emit('join', { room: 'track' })

    socket.on('locationUpdate', data => {
      setOthers(prev => {
        const copy = prev.filter(p=>p.id !== data.id)
        copy.push(data)
        return copy
      })
    })

    return ()=>{
      socket.off('locationUpdate')
      socket.disconnect()
    }
  }, [])

  useEffect(()=>{
    if (!shareLocation) return
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(pos=>{
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const payload = { lat, lng, ts: Date.now() }
      setPositions(p => [...p, [lat,lng]])
      socket.emit('shareLocation', payload)
    }, err=> console.warn(err), { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 })

    return ()=>{ if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current) }
  }, [shareLocation])

  return (
    <MapContainer center={[20.5937,78.9629]} zoom={6} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {positions.length>0 && (
        <Marker position={positions[positions.length-1]}>
          <Popup>You (live)</Popup>
        </Marker>
      )}
      {others.map(o=> (
        <Marker key={o.id} position={[o.lat,o.lng]}>
          <Popup>Vehicle {o.id} — {new Date(o.ts).toLocaleTimeString()}</Popup>
        </Marker>
      ))}
      {positions.length>1 && <Polyline positions={positions} />}
    </MapContainer>
  )
}
