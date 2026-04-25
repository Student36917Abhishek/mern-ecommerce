import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mern_ecommerce_token') || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const bootAuth = async () => {
      const storedUser = localStorage.getItem('mern_ecommerce_user')

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('mern_ecommerce_user')
        }
      }

      if (!token) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      try {
        const { data } = await api.get('/auth/profile')

        if (!isMounted) {
          return
        }

        setUser(data.user)
        localStorage.setItem('mern_ecommerce_user', JSON.stringify(data.user))
      } catch {
        if (isMounted) {
          clearAuth()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    bootAuth()

    return () => {
      isMounted = false
    }
  }, [token])

  const persistAuth = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('mern_ecommerce_token', nextToken)
    localStorage.setItem('mern_ecommerce_user', JSON.stringify(nextUser))
  }

  const clearAuth = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('mern_ecommerce_token')
    localStorage.removeItem('mern_ecommerce_user')
  }

  const signIn = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    persistAuth(data.accessToken, data.user)
    return data
  }

  const signUp = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    persistAuth(data.accessToken, data.user)
    return data
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      signIn,
      signUp,
      signOut: clearAuth,
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}