import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  login: (key: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const API_BASE = import.meta.env.VITE_API_URL || 'https://workspace-api.vercel.app'
const STORAGE_KEY = 'vd_access_key'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  const verify = useCallback(async (key: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/links`, {
        headers: { Authorization: `Bearer ${key}` },
      })
      return res.ok
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (token) {
      verify(token).then((valid) => {
        setIsAuthenticated(valid)
        if (!valid) {
          localStorage.removeItem(STORAGE_KEY)
          setToken(null)
        }
        setChecking(false)
      })
    } else {
      setChecking(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (key: string) => {
    const valid = await verify(key)
    if (valid) {
      localStorage.setItem(STORAGE_KEY, key)
      setToken(key)
      setIsAuthenticated(true)
    }
    return valid
  }, [verify])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setIsAuthenticated(false)
  }, [])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-vd-bg">
        <div className="text-vd-text-dim font-mono text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
