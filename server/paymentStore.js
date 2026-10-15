/**
 * Durable UPI payment submissions (GitHub-backed, same pattern as memberships).
 * server/data/payments.json
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OWNER = process.env.CQ_GITHUB_OWNER || 'rishusingh-netizen'
const REPO = process.env.CQ_GITHUB_REPO || 'computer-quest'
const BRANCH = process.env.CQ_GITHUB_BRANCH || 'main'
const PATH_IN_REPO = 'server/data/payments.json'
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH_IN_REPO}`

function isServerless() {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function githubToken() {
  return String(process.env.CQ_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '').trim()
}

function resolveLocalPath() {
  if (process.env.CQ_PAYMENTS_PATH) return path.resolve(process.env.CQ_PAYMENTS_PATH)
  if (isServerless()) return path.join('/tmp', 'computer-quest-data', 'payments.json')
  return path.join(__dirname, 'data', 'payments.json')
}

function emptyDoc() {
  return { updated_at: new Date().toISOString(), byId: {}, utrIndex: {} }
}

function normalize(doc) {
  if (!doc || typeof doc !== 'object') return emptyDoc()
  return {
    updated_at: doc.updated_at || new Date().toISOString(),
    byId: doc.byId && typeof doc.byId === 'object' ? doc.byId : {},
    utrIndex: doc.utrIndex && typeof doc.utrIndex === 'object' ? doc.utrIndex : {},
  }
}

function writeLocalFile(doc) {
  const p = resolveLocalPath()
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(doc, null, 2))
}

function readLocalFile() {
  try {
    const p = resolveLocalPath()
    if (!fs.existsSync(p)) return emptyDoc()
    return normalize(JSON.parse(fs.readFileSync(p, 'utf8')))
  } catch {
    return emptyDoc()
  }
}

let cache = null
let cacheLoadedAt = 0

async function readGithubMeta() {
  const token = githubToken()
  if (!token) return { content: null, sha: null }
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'computer-quest',
    },
  })
  if (res.status === 404) return { content: emptyDoc(), sha: null }
  if (!res.ok) throw new Error(`GitHub read payments failed: ${res.status}`)
  const data = await res.json()
  const decoded = Buffer.from(data.content || '', 'base64').toString('utf8')
  return { content: normalize(JSON.parse(decoded || '{}')), sha: data.sha }
}

async function writeGithub(doc, sha) {
  const token = githubToken()
  if (!token) throw new Error('CQ_GITHUB_TOKEN not set')
  const body = {
    message: `chore: update payments ledger ${doc.updated_at}`,
    content: Buffer.from(JSON.stringify(doc, null, 2)).toString('base64'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_IN_REPO}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'computer-quest',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub write payments failed: ${res.status} ${err.slice(0, 200)}`)
  }
  return res.json()
}

export async function loadPaymentsDoc({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheLoadedAt < 15_000) return cache
  try {
    if (githubToken()) {
      const meta = await readGithubMeta()
      if (meta.content) {
        cache = meta.content
        cacheLoadedAt = Date.now()
        writeLocalFile(cache)
        return cache
      }
    }
  } catch (e) {
    console.warn('[cq-payments] github load', e.message)
  }
  try {
    const res = await fetch(RAW_URL, { headers: { 'User-Agent': 'computer-quest' } })
    if (res.ok) {
      const doc = normalize(await res.json())
      cache = doc
      cacheLoadedAt = Date.now()
      writeLocalFile(doc)
      return doc
    }
  } catch {
    /* ignore */
  }
  cache = readLocalFile()
  cacheLoadedAt = Date.now()
  return cache
}

export async function savePayment(order) {
  if (!order?.id) return { ok: false, error: 'id required' }
  const doc = await loadPaymentsDoc({ force: true })
  const prev = doc.byId[order.id]
  if (prev?.utr && doc.utrIndex[prev.utr] === order.id) {
    delete doc.utrIndex[prev.utr]
  }
  const next = { ...prev, ...order, updated_at: new Date().toISOString() }
  doc.byId[order.id] = next
  if (next.utr) {
    const utrKey = String(next.utr).trim().toUpperCase()
    next.utr = utrKey
    doc.utrIndex[utrKey] = order.id
  }
  doc.updated_at = next.updated_at
  writeLocalFile(doc)
  cache = doc
  cacheLoadedAt = Date.now()

  let persistedToGitHub = false
  let warning
  try {
    if (githubToken()) {
      const meta = await readGithubMeta()
      const remote = meta.content || emptyDoc()
      remote.byId = { ...remote.byId, [order.id]: next }
      remote.utrIndex = { ...remote.utrIndex }
      if (next.utr) remote.utrIndex[next.utr] = order.id
      remote.updated_at = next.updated_at
      await writeGithub(remote, meta.sha)
      cache = remote
      writeLocalFile(remote)
      persistedToGitHub = true
    } else {
      warning = 'CQ_GITHUB_TOKEN not set — payment saved on this instance only'
    }
  } catch (e) {
    warning = e.message || 'Failed to persist payment to GitHub'
    console.warn('[cq-payments]', warning)
  }

  return {
    ok: true,
    order: next,
    persistedToGitHub,
    durable: persistedToGitHub || !isServerless(),
    warning,
  }
}

export function findOrderById(doc, id) {
  return doc?.byId?.[id] || null
}

export function findOrderByUtr(doc, utr) {
  if (!utr) return null
  const key = String(utr).trim().toUpperCase()
  const id = doc?.utrIndex?.[key]
  return id ? doc.byId[id] : null
}

export function listOrders(doc) {
  return Object.values(doc?.byId || {}).sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || ''))
  )
}

export function listOrdersForUser(doc, userId) {
  return listOrders(doc).filter((o) => o.user_id === userId)
}
