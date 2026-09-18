import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** On Vercel/serverless the project filesystem is read-only; persist under /tmp. */
function resolveDataDir() {
  if (process.env.CQ_DB_PATH) {
    return path.dirname(path.resolve(process.env.CQ_DB_PATH))
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'computer-quest-data')
  }
  return path.join(__dirname, 'data')
}

const dataDir = resolveDataDir()
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath =
  process.env.CQ_DB_PATH || path.join(dataDir, 'computer-quest.json')

const defaultData = () => ({
  users: [],
  memberships: [],
  progress: [],
  orders: [],
  certificates: [],
  course_config: null,
})

function readAll() {
  try {
    if (!fs.existsSync(dbPath)) return defaultData()
    return { ...defaultData(), ...JSON.parse(fs.readFileSync(dbPath, 'utf8')) }
  } catch {
    return defaultData()
  }
}

function writeAll(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

export const db = {
  prepare(sql) {
    return {
      get(...params) {
        return runGet(sql, params)
      },
      all(...params) {
        return runAll(sql, params)
      },
      run(...params) {
        return runRun(sql, params)
      },
    }
  },
}

function runGet(sql, params) {
  const data = readAll()
  const s = sql.replace(/\s+/g, ' ').trim()
  if (s.includes('FROM course_config')) return data.course_config
  if (s.includes('FROM users WHERE email')) return data.users.find((u) => u.email === params[0])
  if (s.includes('FROM users WHERE id')) return data.users.find((u) => u.id === params[0])
  if (s.includes('FROM memberships WHERE user_id')) return data.memberships.find((m) => m.user_id === params[0])
  if (s.includes('FROM progress WHERE user_id')) return data.progress.find((p) => p.user_id === params[0])
  if (s.includes('FROM orders WHERE id = ? AND user_id')) {
    return data.orders.find((o) => o.id === params[0] && o.user_id === params[1])
  }
  if (s.includes('FROM certificates WHERE user_id')) return data.certificates.find((c) => c.user_id === params[0])
  if (s.includes('FROM certificates WHERE upper(id)')) {
    const id = String(params[0] || '').toUpperCase()
    return data.certificates.find((c) => String(c.id).toUpperCase() === id)
  }
  if (s.includes('COUNT(*) as c FROM users WHERE role')) {
    return { c: data.users.filter((u) => u.role === 'student').length }
  }
  if (s.includes("COUNT(*) as c FROM memberships WHERE status = 'active'")) {
    return { c: data.memberships.filter((m) => m.status === 'active').length }
  }
  if (s.includes("COUNT(*) as c FROM orders WHERE status = 'paid'")) {
    return { c: data.orders.filter((o) => o.status === 'paid').length }
  }
  if (s.includes('COUNT(*) as c FROM certificates')) return { c: data.certificates.length }
  return undefined
}

function runAll(sql) {
  const data = readAll()
  const s = sql.replace(/\s+/g, ' ').trim()
  if (s.includes('FROM users u LEFT JOIN memberships')) {
    return data.users.map((u) => {
      const m = data.memberships.find((x) => x.user_id === u.id)
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
        membership_status: m?.status || 'none',
        expires_at: m?.expires_at || null,
      }
    })
  }
  if (s.includes('FROM orders ORDER BY')) {
    return [...data.orders].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 200)
  }
  if (s.includes('FROM certificates ORDER BY')) {
    return [...data.certificates].sort((a, b) => (a.completed_at < b.completed_at ? 1 : -1)).slice(0, 200)
  }
  return []
}

function runRun(sql, params) {
  const data = readAll()
  const s = sql.replace(/\s+/g, ' ').trim()
  if (s.startsWith('INSERT INTO users')) {
    const role = s.includes("'admin'") ? 'admin' : 'student'
    data.users.push({
      id: params[0],
      email: params[1],
      name: params[2],
      password_hash: params[3],
      role,
      created_at: params[4],
    })
    writeAll(data)
    return { changes: 1 }
  }
  if (s.includes('INSERT INTO memberships') && s.includes("VALUES (?, 'none'")) {
    data.memberships.push({
      user_id: params[0],
      status: 'none',
      start_at: null,
      expires_at: null,
      source: null,
      updated_at: params[1],
    })
    writeAll(data)
    return { changes: 1 }
  }
  if (s.includes('INSERT INTO memberships') && s.includes('ON CONFLICT')) {
    const next = {
      user_id: params[0],
      status: 'active',
      start_at: params[1],
      expires_at: params[2],
      source: 'purchase',
      updated_at: params[3],
    }
    const i = data.memberships.findIndex((m) => m.user_id === params[0])
    if (i >= 0) data.memberships[i] = next
    else data.memberships.push(next)
    writeAll(data)
    return { changes: 1 }
  }
  if (s.startsWith('INSERT INTO memberships')) {
    data.memberships.push({
      user_id: params[0],
      status: params[1],
      start_at: params[2],
      expires_at: params[3],
      source: params[4],
      updated_at: params[5],
    })
    writeAll(data)
    return { changes: 1 }
  }
  if (s.includes("UPDATE memberships SET status = 'expired'")) {
    const m = data.memberships.find((x) => x.user_id === params[1])
    if (m) {
      m.status = 'expired'
      m.updated_at = params[0]
      writeAll(data)
    }
    return { changes: 1 }
  }
  if (s.includes('INSERT INTO progress')) {
    const row = { user_id: params[0], data_json: params[1], updated_at: params[2] }
    const i = data.progress.findIndex((p) => p.user_id === params[0])
    if (i >= 0) data.progress[i] = row
    else data.progress.push(row)
    writeAll(data)
    return { changes: 1 }
  }
  if (s.startsWith('INSERT INTO orders')) {
    data.orders.push({
      id: params[0],
      user_id: params[1],
      amount_paise: params[2],
      currency: 'INR',
      status: 'created',
      provider: 'mock',
      provider_ref: null,
      created_at: params[3],
      updated_at: params[4],
    })
    writeAll(data)
    return { changes: 1 }
  }
  if (s.includes("UPDATE orders SET status = 'cancelled'")) {
    const o = data.orders.find((x) => x.id === params[1])
    if (o) {
      o.status = 'cancelled'
      o.updated_at = params[0]
      writeAll(data)
    }
    return { changes: 1 }
  }
  if (s.includes("UPDATE orders SET status = 'failed'")) {
    const o = data.orders.find((x) => x.id === params[1])
    if (o) {
      o.status = 'failed'
      o.updated_at = params[0]
      writeAll(data)
    }
    return { changes: 1 }
  }
  if (s.includes('provider_ref')) {
    const o = data.orders.find((x) => x.id === params[2])
    if (o) {
      o.status = 'paid'
      o.provider_ref = params[0]
      o.updated_at = params[1]
      writeAll(data)
    }
    return { changes: 1 }
  }
  if (s.startsWith('INSERT INTO certificates')) {
    data.certificates.push({
      id: params[0],
      user_id: params[1],
      student_name: params[2],
      course_name: params[3],
      completed_at: params[4],
      status: 'valid',
      snapshot_json: params[5],
    })
    writeAll(data)
    return { changes: 1 }
  }
  if (s.includes('UPDATE course_config')) {
    data.course_config = {
      id: 1,
      price_paise: params[0],
      duration_days: params[1],
      title: params[2],
      completion_json: params[3],
      updated_at: params[4],
    }
    writeAll(data)
    return { changes: 1 }
  }
  return { changes: 0 }
}

export function initDb() {
  const data = readAll()
  if (!data.course_config) {
    data.course_config = {
      id: 1,
      price_paise: 299900,
      duration_days: 730,
      title: 'Computer Quest',
      completion_json: JSON.stringify({
        mode: 'full_course',
        requireAllLessonsFromLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        minPracticeCount: 8,
        minRevisionCount: 10,
        minPassedTests: 9,
        minGamesPlayed: 2,
      }),
      updated_at: new Date().toISOString(),
    }
    writeAll(data)
  }
}
