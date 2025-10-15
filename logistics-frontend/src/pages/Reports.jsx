import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Reports(){
  const [reports, setReports] = useState([])
  useEffect(()=>{ load() }, [])
  const load = async ()=>{
    const res = await api.get('/reports')
    setReports(res.data)
  }
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="font-bold">Reports</h3>
      <ul className="mt-3">
        {reports.map(r=> <li key={r.id} className="p-2 border rounded mt-2">{r.title}</li>)}
      </ul>
    </div>
  )
}
