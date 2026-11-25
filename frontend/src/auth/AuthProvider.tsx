import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type User } from './AuthContext'
import { ApiError, apiRequest } from '../lib/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<{ user: User }>('/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch((error: unknown) => {
        if (active) {
          setUser(null)
          if (!(error instanceof ApiError && error.status === 401)) {
            setSessionError(error instanceof Error ? error.message : 'Could not verify your session.')
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const result = await apiRequest<{ user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password, rememberMe },
    })
    setUser(result.user)
    setSessionError('')
    return result.user
  }, [])

  const register = useCallback(async (input: {
    fullName: string
    email: string
    password: string
    phone: string
    role: 'customer' | 'musician'
  }) => {
    const result = await apiRequest<{ user: User }>('/auth/register', {
      method: 'POST',
      body: input,
    })
    setUser(result.user)
    setSessionError('')
    return result.user
  }, [])

  const logout = useCallback(async () => {
    await apiRequest<void>('/auth/logout', { method: 'POST' })
    setUser(null)
    setSessionError('')
  }, [])

  const value = useMemo(() => ({ user, loading, sessionError, login, register, logout }), [user, loading, sessionError, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
