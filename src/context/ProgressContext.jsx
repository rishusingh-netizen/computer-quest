import { createContext, useContext, useEffect, useReducer, useCallback, useState, useRef } from 'react'
import { load, save } from '../utils/storage'
import { api, getToken } from '../services/api'
import { getTotalLessons } from '../data/levels'
import { useAuth } from './AuthContext'

const ProgressContext = createContext(null)

const defaultState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  completedLessons: [],
  lessonScores: {},
  practiceCompleted: [],
  practiceScores: {},
  gamesPlayed: {},
  testScores: {},
  revisionScores: {},
  revisionCompleted: [],
  achievements: [],
  weakTopics: [],
  strongTopics: [],
  settings: {
    language: 'en',
  },
}

function calcUserLevel(xp) {
  return Math.max(1, Math.floor((xp || 0) / 200) + 1)
}

function todayStr() {
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
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
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
}

/** Merge two progress blobs without dropping completed lessons or lowering XP. */
function mergeProgressState(local, remote) {
  const left = local && typeof local === 'object' ? local : {}
  const right = remote && typeof remote === 'object' ? remote : {}
  const union = (a, b) => [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])]
  const xp = Math.max(
    typeof left.xp === 'number' ? left.xp : 0,
    typeof right.xp === 'number' ? right.xp : 0,
    0
  )
  return {
    ...defaultState,
    ...left,
    ...right,
    xp,
    level: calcUserLevel(xp),
    streak: Math.max(left.streak || 0, right.streak || 0),
    lastActiveDate: newerDate(left.lastActiveDate, right.lastActiveDate),
    completedLessons: union(left.completedLessons, right.completedLessons),
    practiceCompleted: union(left.practiceCompleted, right.practiceCompleted),
    revisionCompleted: union(left.revisionCompleted, right.revisionCompleted),
    achievements: union(left.achievements, right.achievements),
    lessonScores: { ...(left.lessonScores || {}), ...(right.lessonScores || {}) },
    practiceScores: { ...(left.practiceScores || {}), ...(right.practiceScores || {}) },
    revisionScores: { ...(left.revisionScores || {}), ...(right.revisionScores || {}) },
    testScores: { ...(left.testScores || {}), ...(right.testScores || {}) },
    gamesPlayed: { ...(left.gamesPlayed || {}), ...(right.gamesPlayed || {}) },
    weakTopics: Array.isArray(right.weakTopics)
      ? right.weakTopics
      : Array.isArray(left.weakTopics)
        ? left.weakTopics
        : [],
    strongTopics: Array.isArray(right.strongTopics)
      ? right.strongTopics
      : Array.isArray(left.strongTopics)
        ? left.strongTopics
        : [],
    settings:
      right.settings && typeof right.settings === 'object'
        ? { ...(left.settings || {}), ...right.settings }
        : left.settings || defaultState.settings,
  }
}

function normalizeProgress(saved) {
  if (!saved || typeof saved !== 'object') return { ...defaultState }
  const merged = { ...defaultState, ...saved }
  if (!Array.isArray(merged.completedLessons)) merged.completedLessons = []
  if (!Array.isArray(merged.practiceCompleted)) merged.practiceCompleted = []
  if (!Array.isArray(merged.revisionCompleted)) merged.revisionCompleted = []
  if (!Array.isArray(merged.achievements)) merged.achievements = []
  if (!Array.isArray(merged.weakTopics)) merged.weakTopics = []
  if (!Array.isArray(merged.strongTopics)) merged.strongTopics = []
  if (!merged.practiceScores || typeof merged.practiceScores !== 'object') merged.practiceScores = {}
  if (!merged.revisionScores || typeof merged.revisionScores !== 'object') merged.revisionScores = {}
  if (!merged.lessonScores || typeof merged.lessonScores !== 'object') merged.lessonScores = {}
  if (!merged.testScores || typeof merged.testScores !== 'object') merged.testScores = {}
  if (!merged.gamesPlayed || typeof merged.gamesPlayed !== 'object') merged.gamesPlayed = {}
  if (typeof merged.xp !== 'number' || merged.xp < 0) merged.xp = 0
  if (typeof merged.streak !== 'number' || merged.streak < 0) merged.streak = 0
  merged.lastActiveDate = normalizeDate(merged.lastActiveDate)
  merged.level = calcUserLevel(merged.xp)
  return merged
}

function loadInitialState() {
  return normalizeProgress(load('progress', null))
}

function progressReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const payload = action.payload || {}
      return mergeProgressState(state, payload)
    }

    case 'ADD_XP': {
      const xp = state.xp + (action.amount || 0)
      return { ...state, xp, level: calcUserLevel(xp) }
    }

    case 'COMPLETE_LESSON': {
      const { lessonId, score, total, xpReward } = action
      if (state.completedLessons.includes(lessonId)) {
        return {
          ...state,
          lessonScores: {
            ...state.lessonScores,
            [lessonId]: { score, total, date: todayStr() },
          },
        }
      }
      const completedLessons = [...state.completedLessons, lessonId]
      const xp = state.xp + (xpReward || 0)
      return {
        ...state,
        completedLessons,
        xp,
        level: calcUserLevel(xp),
        lessonScores: {
          ...state.lessonScores,
          [lessonId]: { score, total, date: todayStr() },
        },
      }
    }

    case 'COMPLETE_PRACTICE': {
      const { practiceId, score, total, xpReward, attempts } = action
      const already = state.practiceCompleted.includes(practiceId)
      const prev = state.practiceScores[practiceId] || { attempts: 0, bestScore: 0 }
      const practiceScores = {
        ...state.practiceScores,
        [practiceId]: {
          score,
          total,
          bestScore: Math.max(prev.bestScore, score || 0),
          attempts: (prev.attempts || 0) + (attempts || 1),
          date: todayStr(),
        },
      }
      if (already) {
        return { ...state, practiceScores }
      }
      const practiceCompleted = [...state.practiceCompleted, practiceId]
      const xp = state.xp + (xpReward || 0)
      return {
        ...state,
        practiceCompleted,
        practiceScores,
        xp,
        level: calcUserLevel(xp),
      }
    }

    case 'UPDATE_STREAK': {
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
    }

    case 'RECORD_GAME': {
      const { gameId, score, best, xpReward } = action
      const prev = state.gamesPlayed[gameId] || { plays: 0, bestScore: 0 }
      const isFirst = prev.plays === 0
      const newBest = Math.max(prev.bestScore, best ?? score ?? 0)
      let xpGain = 0
      if (isFirst && xpReward) xpGain = xpReward
      else if (!isFirst && xpReward && newBest > prev.bestScore) xpGain = Math.max(5, Math.floor(xpReward / 4))
      const xp = state.xp + xpGain
      return {
        ...state,
        xp,
        level: calcUserLevel(xp),
        gamesPlayed: {
          ...state.gamesPlayed,
          [gameId]: {
            plays: prev.plays + 1,
            bestScore: newBest,
            lastScore: score,
            lastXp: xpGain,
          },
        },
      }
    }

    case 'RECORD_TEST': {
      const { testId, score, total, xpReward, weakTopics, timeTaken, passed, topicStats } = action
      const prev = state.testScores[testId] || { attempts: 0, bestScore: 0, history: [] }
      const isFirst = prev.attempts === 0
      const newBest = Math.max(prev.bestScore || 0, score || 0)
      let xpGain = 0
      if (isFirst && xpReward) xpGain = xpReward
      else if (!isFirst && xpReward && newBest > (prev.bestScore || 0)) {
        xpGain = Math.max(5, Math.floor(xpReward / 3))
      }
      const history = [
        ...(prev.history || []).slice(-9),
        { score, total, date: todayStr(), timeTaken, passed: !!passed },
      ]
      const weakSet = new Set([...(state.weakTopics || []), ...(weakTopics || [])])
      const strongThis = (topicStats || [])
        .filter((t) => t.total > 0 && t.correct / t.total >= 0.7)
        .map((t) => t.topic)
      strongThis.forEach((t) => weakSet.delete(t))
      const xp = state.xp + xpGain
      return {
        ...state,
        xp,
        level: calcUserLevel(xp),
        weakTopics: [...weakSet],
        testScores: {
          ...state.testScores,
          [testId]: {
            score,
            total,
            bestScore: newBest,
            attempts: (prev.attempts || 0) + 1,
            lastScore: score,
            lastXp: xpGain,
            accuracy: total ? Math.round((score / total) * 100) : 0,
            passed: !!passed,
            timeTaken,
            date: todayStr(),
            history,
            topicStats: topicStats || prev.topicStats || [],
          },
        },
      }
    }

    case 'COMPLETE_REVISION': {
      const { topicId, score, total, xpReward, clearWeakTopics } = action
      const prev = state.revisionScores[topicId] || { attempts: 0, bestScore: 0 }
      const isFirst = prev.attempts === 0
      const newBest = Math.max(prev.bestScore || 0, score || 0)
      let xpGain = 0
      if (isFirst && xpReward) xpGain = xpReward
      else if (!isFirst && newBest > (prev.bestScore || 0)) xpGain = Math.max(3, Math.floor((xpReward || 10) / 2))
      const revisionCompleted = state.revisionCompleted.includes(topicId)
        ? state.revisionCompleted
        : [...state.revisionCompleted, topicId]
      let weakTopics = state.weakTopics || []
      if (clearWeakTopics?.length && total && score / total >= 0.7) {
        const remove = new Set(clearWeakTopics)
        weakTopics = weakTopics.filter((t) => !remove.has(t))
      }
      const xp = state.xp + xpGain
      return {
        ...state,
        xp,
        level: calcUserLevel(xp),
        weakTopics,
        revisionCompleted,
        revisionScores: {
          ...state.revisionScores,
          [topicId]: {
            lastScore: score,
            lastTotal: total,
            bestScore: newBest,
            attempts: (prev.attempts || 0) + 1,
            accuracy: total ? Math.round((score / total) * 100) : 0,
            lastXp: xpGain,
            date: todayStr(),
          },
        },
      }
    }

    case 'ADD_ACHIEVEMENT': {
      if (state.achievements.includes(action.id)) return state
      return { ...state, achievements: [...state.achievements, action.id] }
    }

    case 'SET_SETTING': {
      return {
        ...state,
        settings: { ...state.settings, [action.key]: action.value },
      }
    }

    case 'RESET_PROGRESS':
      return { ...defaultState, lastActiveDate: todayStr(), streak: 1 }

    default:
      return state
  }
}

export function ProgressProvider({ children }) {
  const { user, isLoggedIn, ready: authReady } = useAuth()
  const [state, dispatch] = useReducer(progressReducer, null, loadInitialState)
  const [ready, setReady] = useState(false)
  const [hydratedForUser, setHydratedForUser] = useState(null)
  const lastUserIdRef = useRef(null)
  const streakReconciledRef = useRef(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!authReady) return
    const uid = user?.id || null
    if (uid && uid !== lastUserIdRef.current) {
      const scoped = load(`progress_${uid}`, null)
      if (scoped) {
        dispatch({ type: 'HYDRATE', payload: normalizeProgress(scoped) })
      }
      lastUserIdRef.current = uid
      setHydratedForUser(null)
      streakReconciledRef.current = false
    }
    if (!uid && lastUserIdRef.current) {
      lastUserIdRef.current = null
      setHydratedForUser(null)
      streakReconciledRef.current = false
    }
  }, [authReady, user?.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!authReady) return
      if (!isLoggedIn || !getToken() || !user?.id) return
      const res = await api.getProgress()
      if (cancelled) return
      if (res.ok && res.progress) {
        dispatch({ type: 'HYDRATE', payload: res.progress })
      }
      if (!cancelled) setHydratedForUser(user.id)
    })()
    return () => {
      cancelled = true
    }
  }, [authReady, isLoggedIn, user?.id])

  useEffect(() => {
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
    if (user?.id) {
      save(`progress_${user.id}`, state)
    }
    if (!getToken() || !user?.id) return
    if (hydratedForUser !== user.id) return
    api.putProgress(state).catch(() => {})
  }, [state, ready, user?.id, hydratedForUser])

  const addXp = useCallback((amount) => {
    dispatch({ type: 'ADD_XP', amount })
  }, [])

  const completeLesson = useCallback((lessonId, score, total, xpReward) => {
    dispatch({ type: 'COMPLETE_LESSON', lessonId, score, total, xpReward })
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])

  const completePractice = useCallback((practiceId, score, total, xpReward) => {
    dispatch({ type: 'COMPLETE_PRACTICE', practiceId, score, total, xpReward, attempts: 1 })
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])

  const updateStreak = useCallback(() => {
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])

  const recordGame = useCallback((gameId, score, best, xpReward = 0) => {
    dispatch({ type: 'RECORD_GAME', gameId, score, best, xpReward })
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])

  const recordTest = useCallback((testId, score, total, meta = {}) => {
    dispatch({
      type: 'RECORD_TEST',
      testId,
      score,
      total,
      xpReward: meta.xpReward || 0,
      weakTopics: meta.weakTopics || [],
      timeTaken: meta.timeTaken,
      passed: meta.passed,
      topicStats: meta.topicStats || [],
    })
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])

  const completeRevision = useCallback((topicId, score, total, xpReward = 10, clearWeakTopics = []) => {
    dispatch({
      type: 'COMPLETE_REVISION',
      topicId,
      score,
      total,
      xpReward,
      clearWeakTopics,
    })
    dispatch({ type: 'UPDATE_STREAK' })
  }, [])

  const addAchievement = useCallback((id) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', id })
  }, [])

  const setSetting = useCallback((key, value) => {
    dispatch({ type: 'SET_SETTING', key, value })
  }, [])

  const resetProgress = useCallback(() => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      dispatch({ type: 'RESET_PROGRESS' })
    }
  }, [])

  const isLessonCompleted = useCallback(
    (lessonId) => state.completedLessons.includes(lessonId),
    [state.completedLessons]
  )

  const isPracticeCompleted = useCallback(
    (practiceId) => state.practiceCompleted.includes(practiceId),
    [state.practiceCompleted]
  )

  const totalLessons = getTotalLessons()
  const lessonsCompletedCount = state.completedLessons.length
  const progressPercent = totalLessons > 0 ? Math.round((lessonsCompletedCount / totalLessons) * 100) : 0

  const value = {
    ...state,
    totalLessons,
    lessonsCompletedCount,
    progressPercent,
    addXp,
    completeLesson,
    completePractice,
    updateStreak,
    recordGame,
    recordTest,
    completeRevision,
    addAchievement,
    setSetting,
    resetProgress,
    isLessonCompleted,
    isPracticeCompleted,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
