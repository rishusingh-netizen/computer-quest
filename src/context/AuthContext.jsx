import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import * as authStore from '../services/authStore'
import { daysRemaining } from '../config/course'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [serverOk, setServerOk] = useState(true)

  useEffect(() => {
    ;(async () => {
      const online = await authStore.ensureAdminBootstrap()
      setServerOk(online)
      const sessionUser = await authStore.restoreSession()
      if (sessionUser) setUser(sessionUser)
      setReady(true)
    })()
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
      hasAccess,
      isAdmin,
      accessDaysLeft,
    }),
    [user, ready, serverOk, isLoggedIn, signup, login, logout, refreshUser, hasAccess, isAdmin, accessDaysLeft]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
