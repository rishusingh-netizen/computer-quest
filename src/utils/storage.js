/**
 * Simple localStorage helpers for Computer Quest progress.
 */

const PREFIX = 'cq_'

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to save to localStorage', e)
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {}
}
