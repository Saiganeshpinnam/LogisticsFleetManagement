import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  const login = async (creds) => {
    const res = await api.post('/auth/login', creds)
    setUser(res.data.user)
    return res
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    setUser(res.data.user)
    return res
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
