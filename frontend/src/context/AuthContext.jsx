import { createContext, useCallback, useEffect, useState } from 'react'
import { loginApi, meApi } from '../api/auth'
import { clearTokens, getAccessToken, setTokens } from '../utils/token'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getAccessToken()) {
        setLoading(false)
        return
      }

      try {
        const user = await meApi()
        if (!cancelled) setAuth(user)
      } catch {
        clearTokens()
        if (!cancelled) setAuth(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const tokens = await loginApi(credentials)
    setTokens({ access: tokens.access, refresh: tokens.refresh })

    try {
      const user = await meApi()
      setAuth(user)
      return user
    } catch (error) {
      clearTokens()
      setAuth(null)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setAuth(null)
  }, [])

  const value = { auth, loading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
