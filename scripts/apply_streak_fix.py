#!/usr/bin/env python3
from pathlib import Path
import subprocess
p = Path('src/context/ProgressContext.jsx')
t = p.read_text()
if 'streakReconciledRef' in t and 'function normalizeDate' in t and 'toISOString' not in t:
    print('ALREADY_FIXED'); raise SystemExit(0)
if len(t) < 500 or 'PLACEHOLDER' in t:
    t = subprocess.check_output(['git','show','c4c89e1f:src/context/ProgressContext.jsx'], text=True)
    print('RESTORED', len(t))
assert len(t) > 10000
a = "function todayStr() {\n  return new Date().toISOString().slice(0, 10)\n}"
b = "function todayStr() {\n  const d = new Date()\n  const y = d.getFullYear()\n  const m = String(d.getMonth() + 1).padStart(2, '0')\n  const day = String(d.getDate()).padStart(2, '0')\n  return `${y}-${m}-${day}`\n}\n\nfunction normalizeDate(value) {\n  if (value == null) return null\n  const s = String(value).trim()\n  if (!s) return null\n  const day = s.slice(0, 10)\n  return /^\\d{4}-\\d{2}-\\d{2}$/.test(day) ? day : null\n}\n\nfunction yesterdayStr() {\n  const d = new Date()\n  d.setDate(d.getDate() - 1)\n  const y = d.getFullYear()\n  const m = String(d.getMonth() + 1).padStart(2, '0')\n  const day = String(d.getDate()).padStart(2, '0')\n  return `${y}-${m}-${day}`\n}\n\nfunction newerDate(a, b) {\n  const na = normalizeDate(a)\n  const nb = normalizeDate(b)\n  if (na && nb) return na >= nb ? na : nb\n  return na || nb || null\n}"
if a not in t: raise SystemExit('no todayStr')
t = t.replace(a, b, 1)
a = "    lastActiveDate: right.lastActiveDate || left.lastActiveDate || null,"
b = "    lastActiveDate: newerDate(left.lastActiveDate, right.lastActiveDate),"
if a not in t: raise SystemExit('no merge')
t = t.replace(a, b, 1)
a = "  if (typeof merged.streak !== 'number' || merged.streak < 0) merged.streak = 0\n  merged.level = calcUserLevel(merged.xp)\n  return merged\n}"
b = "  if (typeof merged.streak !== 'number' || merged.streak < 0) merged.streak = 0\n  merged.lastActiveDate = normalizeDate(merged.lastActiveDate)\n  merged.level = calcUserLevel(merged.xp)\n  return merged\n}"
if a not in t: raise SystemExit('no norm')
t = t.replace(a, b, 1)
a = "    case 'UPDATE_STREAK': {\n      const today = todayStr()\n      if (state.lastActiveDate === today) return state\n      const yesterday = new Date()\n      yesterday.setDate(yesterday.getDate() - 1)\n      const yStr = yesterday.toISOString().slice(0, 10)\n      let streak = state.streak\n      if (state.lastActiveDate === yStr) {\n        streak += 1\n      } else {\n        streak = 1\n      }\n      return { ...state, streak, lastActiveDate: today }\n    }"
b = "    case 'UPDATE_STREAK': {\n      const today = todayStr()\n      const last = normalizeDate(state.lastActiveDate)\n      if (last === today) {\n        if (state.lastActiveDate === today) return state\n        return { ...state, lastActiveDate: today }\n      }\n      const yStr = yesterdayStr()\n      let streak = typeof state.streak === 'number' && state.streak > 0 ? state.streak : 0\n      if (last === yStr) {\n        streak += 1\n      } else {\n        streak = 1\n      }\n      return { ...state, streak, lastActiveDate: today }\n    }"
if a not in t: raise SystemExit('no update_streak')
t = t.replace(a, b, 1)
a = "  const [hydratedForUser, setHydratedForUser] = useState(null)\n  const lastUserIdRef = useRef(null)\n\n  useEffect(() => {\n    dispatch({ type: 'UPDATE_STREAK' })\n    setReady(true)\n  }, [])\n\n  // Load user-scoped local cache when auth identity becomes known\n  useEffect(() => {\n    if (!authReady) return\n    const uid = user?.id || null\n    if (uid && uid !== lastUserIdRef.current) {\n      const scoped = load(`progress_${uid}`, null)\n      if (scoped) {\n        dispatch({ type: 'HYDRATE', payload: normalizeProgress(scoped) })\n      }\n      lastUserIdRef.current = uid\n      setHydratedForUser(null)\n    }\n    if (!uid && lastUserIdRef.current) {\n      lastUserIdRef.current = null\n      setHydratedForUser(null)\n    }\n  }, [authReady, user?.id])\n\n  // Fetch durable progress from API whenever a logged-in user is present\n  useEffect(() => {\n    let cancelled = false\n    ;(async () => {\n      if (!authReady) return\n      if (!isLoggedIn || !getToken() || !user?.id) return\n      const res = await api.getProgress()\n      if (cancelled) return\n      if (res.ok && res.progress) {\n        dispatch({ type: 'HYDRATE', payload: res.progress })\n      }\n      if (!cancelled) setHydratedForUser(user.id)\n    })()\n    return () => {\n      cancelled = true\n    }\n  }, [authReady, isLoggedIn, user?.id])\n"
b = "  const [hydratedForUser, setHydratedForUser] = useState(null)\n  const lastUserIdRef = useRef(null)\n  const streakReconciledRef = useRef(false)\n\n  useEffect(() => {\n    setReady(true)\n  }, [])\n\n  // Load user-scoped local cache when auth identity becomes known\n  useEffect(() => {\n    if (!authReady) return\n    const uid = user?.id || null\n    if (uid && uid !== lastUserIdRef.current) {\n      const scoped = load(`progress_${uid}`, null)\n      if (scoped) {\n        dispatch({ type: 'HYDRATE', payload: normalizeProgress(scoped) })\n      }\n      lastUserIdRef.current = uid\n      setHydratedForUser(null)\n      streakReconciledRef.current = false\n    }\n    if (!uid && lastUserIdRef.current) {\n      lastUserIdRef.current = null\n      setHydratedForUser(null)\n      streakReconciledRef.current = false\n    }\n  }, [authReady, user?.id])\n\n  // Fetch durable progress from API whenever a logged-in user is present\n  useEffect(() => {\n    let cancelled = false\n    ;(async () => {\n      if (!authReady) return\n      if (!isLoggedIn || !getToken() || !user?.id) return\n      const res = await api.getProgress()\n      if (cancelled) return\n      if (res.ok && res.progress) {\n        dispatch({ type: 'HYDRATE', payload: res.progress })\n      }\n      if (!cancelled) setHydratedForUser(user.id)\n    })()\n    return () => {\n      cancelled = true\n    }\n  }, [authReady, isLoggedIn, user?.id])\n\n  // Once-per-init streak reconciliation after local+server progress is ready\n  useEffect(() => {\n    if (!ready || !authReady) return\n    if (!isLoggedIn || !user?.id) {\n      if (streakReconciledRef.current) return\n      streakReconciledRef.current = true\n      dispatch({ type: 'UPDATE_STREAK' })\n      return\n    }\n    if (hydratedForUser !== user.id) return\n    if (streakReconciledRef.current) return\n    streakReconciledRef.current = true\n    dispatch({ type: 'UPDATE_STREAK' })\n  }, [ready, authReady, isLoggedIn, user?.id, hydratedForUser])\n"
if a not in t: raise SystemExit('no provider')
t = t.replace(a, b, 1)
assert 'streakReconciledRef' in t and 'toISOString' not in t and len(t) > 15000
p.write_text(t)
print('PATCHED_OK', len(t))
