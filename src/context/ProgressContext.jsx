import { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react'
import { load, save } from '../utils/storage'
import { api, getToken } from '../services/api'
import { getTotalLessons } from '../data/levels'

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
  return new Date().toISOString().slice(0, 10)
}

function loadInitialState() {
  const saved = load('progress', null)
  if (saved && typeof saved === 'object') {
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
    merged.level = calcUserLevel(merged.xp)
    return merged
  }
  return { ...defaultState }
}

function progressReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const payload = action.payload || {}
      return { ...state, ...payload, level: calcUserLevel(payload.xp ?? state.xp) }
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
  const [state, dispatch] = useReducer(progressReducer, null, loadInitialState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' })
    setReady(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!getToken()) return
      const res = await api.getProgress()
      if (!cancelled && res.ok && res.progress) {
        dispatch({ type: 'HYDRATE', payload: res.progress })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    save('progress', state)
    if (getToken()) {
      api.putProgress(state).catch(() => {})
    }
  }, [state, ready])

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
