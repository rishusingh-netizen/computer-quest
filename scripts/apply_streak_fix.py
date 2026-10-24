#!/usr/bin/env python3
from pathlib import Path
import subprocess

COMMIT = "c4c89e1f312781698ffcd6b5910d813f5b2c9d03"
p = Path("src/context/ProgressContext.jsx")
t = p.read_text()
if "streakReconciledRef" in t and "function normalizeDate" in t and "toISOString" not in t:
    print("ALREADY_FIXED")
    raise SystemExit(0)
if len(t) < 500 or "PLACEHOLDER" in t:
    t = subprocess.check_output(["git", "show", f"{COMMIT}:src/context/ProgressContext.jsx"], text=True)
    print("RESTORED", len(t))
assert len(t) > 10000

a = "function todayStr() {\n  return new Date().toISOString().slice(0, 10)\n}"
b = """function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function normalizeDate(value) {
  if (value == null) return null
  const s = String(value).trim()
  if (!s) return null
  const day = s.slice(0, 10)
  return /^\\d{4}-\\d{2}-\\d{2}$/.test(day) ? day : null
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function newerDate(a, b) {
  const na = normalizeDate(a)
  const nb = normalizeDate(b)
  if (na && nb) return na >= nb ? na : nb
  return na || nb || null
}"""
if a not in t:
    raise SystemExit("no todayStr")
t = t.replace(a, b, 1)

a = "    lastActiveDate: right.lastActiveDate || left.lastActiveDate || null,"
b = "    lastActiveDate: newerDate(left.lastActiveDate, right.lastActiveDate),"
if a not in t:
    raise SystemExit("no merge")
t = t.replace(a, b, 1)

a = "  if (typeof merged.streak !== 'number' || merged.streak < 0) merged.streak = 0\n  merged.level = calcUserLevel(merged.xp)\n  return merged\n}"
b = "  if (typeof merged.streak !== 'number' || merged.streak < 0) merged.streak = 0\n  merged.lastActiveDate = normalizeDate(merged.lastActiveDate)\n  merged.level = calcUserLevel(merged.xp)\n  return merged\n}"
if a not in t:
    raise SystemExit("no norm")
t = t.replace(a, b, 1)

a = """    case 'UPDATE_STREAK': {
      const today = todayStr()
      if (state.lastActiveDate === today) return state
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().slice(0, 10)
      let streak = state.streak
      if (state.lastActiveDate === yStr) {
        streak += 1
      } else {
        streak = 1
      }
      return { ...state, streak, lastActiveDate: today }
    }"""
b = """    case 'UPDATE_STREAK': {
      const today = todayStr()
      const last = normalizeDate(state.lastActiveDate)
      if (last === today) {
        if (state.lastActiveDate === today) return state
        return { ...state, lastActiveDate: today }
      }
      const yStr = yesterdayStr()
      let streak = typeof state.streak === 'number' && state.streak > 0 ? state.streak : 0
      if (last === yStr) {
        streak += 1
      } else {
        streak = 1
      }
      return { ...state, streak, lastActiveDate: today }
    }"""
if a not in t:
    raise SystemExit("no update_streak")
t = t.replace(a, b, 1)

old_mount = """  const [hydratedForUser, setHydratedForUser] = useState(null)
  const lastUserIdRef = useRef(null)

  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' })
    setReady(true)
  }, [])
"""
new_mount = """  const [hydratedForUser, setHydratedForUser] = useState(null)
  const lastUserIdRef = useRef(null)
  const streakReconciledRef = useRef(false)

  useEffect(() => {
    setReady(true)
  }, [])
"""
if old_mount not in t:
    raise SystemExit("no mount")
t = t.replace(old_mount, new_mount, 1)

old_uid = """      lastUserIdRef.current = uid
      setHydratedForUser(null)
    }
    if (!uid && lastUserIdRef.current) {
      lastUserIdRef.current = null
      setHydratedForUser(null)
    }
  }, [authReady, user?.id])
"""
new_uid = """      lastUserIdRef.current = uid
      setHydratedForUser(null)
      streakReconciledRef.current = false
    }
    if (!uid && lastUserIdRef.current) {
      lastUserIdRef.current = null
      setHydratedForUser(null)
      streakReconciledRef.current = false
    }
  }, [authReady, user?.id])
"""
if old_uid not in t:
    raise SystemExit("no uid")
t = t.replace(old_uid, new_uid, 1)

old_persist = """  useEffect(() => {
    if (!ready) return
    save('progress', state)
"""
new_persist = """  useEffect(() => {
    if (!ready || !authReady) return
    if (!isLoggedIn || !user?.id) {
      if (streakReconciledRef.current) return
      streakReconciledRef.current = true
      dispatch({ type: 'UPDATE_STREAK' })
      return
    }
    if (hydratedForUser !== user.id) return
    if (streakReconciledRef.current) return
    streakReconciledRef.current = true
    dispatch({ type: 'UPDATE_STREAK' })
  }, [ready, authReady, isLoggedIn, user?.id, hydratedForUser])

  useEffect(() => {
    if (!ready) return
    save('progress', state)
"""
if old_persist not in t:
    raise SystemExit("no persist")
t = t.replace(old_persist, new_persist, 1)

assert "streakReconciledRef" in t and "toISOString" not in t and len(t) > 15000
p.write_text(t)
print("PATCHED_OK", len(t))
