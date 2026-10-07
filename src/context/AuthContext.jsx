import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authStore from '../services/authStore'

const AuthContext = createContext(null)

function daysRemaining(expiresAt) {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (!Number.isFinite(ms)) return null
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [serverOk, setServerOk] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await authStore.ensureAdminBootstrap()
        const sessionUser = await authStore.restoreSession()
        if (!cancelled) {
          setUser(sessionUser)
          setServerOk(authStore.isApiOnline())
        }
      } catch {
        if (!cancelled) setServerOk(false)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const signup = useCallback(async (payload) => {
    const res = await authStore.signUp(payload)
    if (res.ok) setUser(res.user)
    return res
  }, [])

  const login = useCallback(async (payload) => {
    const res = await authStore.login(payload)
    if (res.ok) setUser(res.user)
    return res
  }, [])

  const logout = useCallback(() => {
    authStore.logout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const sessionUser = await authStore.restoreSession()
    setUser(sessionUser)
    return sessionUser
  }, [])

  /** Apply user (+ optional new JWT) from payment confirm without a full re-login. */
  const applySession = useCallback((nextUser, token) => {
    authStore.applySession(nextUser, token)
    if (nextUser) setUser(nextUser)
    return nextUser
  }, [])

  const isLoggedIn = Boolean(user)
  const hasAccess = useMemo(() => authStore.hasActiveAccess(user), [user])
  const isAdmin = useMemo(() => authStore.isAdminUser(user), [user])
  const accessDaysLeft = useMemo(() => {
    if (!user?.membership?.expiresAt) return null
    return daysRemaining(user.membership.expiresAt)
  }, [user])

  const value = useMemo(
    () => ({
      user,
      ready,
      serverOk,
      isLoggedIn,
      signup,
      login,
      logout,
      refreshUser,
      applySession,
      hasAccess,
      isAdmin,
      accessDaysLeft,
      membership: user?.membership || null,
    }),
    [user, ready, serverOk, isLoggedIn, signup, login, logout, refreshUser, applySession, hasAccess, isAdmin, accessDaysLeft]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
