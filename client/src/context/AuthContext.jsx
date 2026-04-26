import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mern_ecommerce_token') || '')
  const [loading, setLoading] = useState(true)

  const persistAuth = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('mern_ecommerce_token', nextToken)
    localStorage.setItem('mern_ecommerce_user', JSON.stringify(nextUser))
  }, [])

  const clearAuth = useCallback(() => {
    setToken('')
    setUser(null)
    localStorage.removeItem('mern_ecommerce_token')
    localStorage.removeItem('mern_ecommerce_user')
  }, [])

  const signIn = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    persistAuth(data.accessToken, data.user)
    return data
  }, [persistAuth])

  const signUp = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    persistAuth(data.accessToken, data.user)
    return data
  }, [persistAuth])

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put('/auth/profile', payload)
    setUser(data.user)
    localStorage.setItem('mern_ecommerce_user', JSON.stringify(data.user))
    return data
  }, [])

  const submitSellerRequest = useCallback(async (payload = {}) => {
    const { data } = await api.post('/auth/seller-request', payload)
    setUser(data.user)
    localStorage.setItem('mern_ecommerce_user', JSON.stringify(data.user))
    return data
  }, [])

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
  }, [clearAuth, token])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      signIn,
      signUp,
      updateProfile,
      submitSellerRequest,
      signOut: clearAuth,
    }),
    [clearAuth, loading, signIn, signUp, submitSellerRequest, token, updateProfile, user],
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
