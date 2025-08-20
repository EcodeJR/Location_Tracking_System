import { useMemo, useState, useEffect, useContext } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/backend'
import { AuthCtx } from './authContextStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const profile = localStorage.getItem('user')
    if (token && profile) setUser(JSON.parse(profile))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await apiRegister(payload)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, register, logout, loading }), [user, loading])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => {
  return useContext(AuthCtx)
}