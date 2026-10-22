#!/usr/bin/env python3
"""Minimal surgical patch: ensureAdmin only CQ_ADMIN_EMAIL; hide adminEmail on /api/health."""
import re
from pathlib import Path

p = Path('server/index.js')
t = p.read_text()
assert len(t) > 20000, f'too small: {len(t)}'
assert 'export default app' in t
assert 'PLACEHOLDER' not in t

m = re.search(r'async function ensureAdmin\(\) \{[\s\S]*?\n\}', t)
assert m, 'ensureAdmin not found'
old = m.group(0)
warn_line = [ln for ln in old.splitlines() if 'CQ_ADMIN_PASSWORD is empty' in ln][0]

new = f'''async function ensureAdmin() {{
  if (!ADMIN_PASSWORD) {{
    {warn_line.strip()}
  }}
  // Only CQ_ADMIN_EMAIL is treated as admin (no hardcoded extra admin emails).
  const email = ADMIN_EMAIL
  if (!email) return
  const password_hash = await hashPassword(ADMIN_PASSWORD)
  const now = new Date().toISOString()
  try {{
    const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(email)
    if (existing) {{
      db.prepare(`UPDATE users SET password_hash = ?, role = 'admin', name = ? WHERE email = ?`).run(
        password_hash,
        'Course Admin',
        email
      )
      grantAdminMembership(existing.id)
      return
    }}
    const id = uid('usr')
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`
    ).run(id, email, 'Course Admin', password_hash, now)
    grantAdminMembership(id)
  }} catch (e) {{
    console.warn(`[cq-api] ensureAdmin failed for ${{email}}:`, e.message)
  }}
}}'''

t2 = t[: m.start()] + new + t[m.end() :]
old_health = (
    "  res.json({ ok: true, service: 'computer-quest-api', ts: new Date().toISOString(), "
    "adminEmail: ADMIN_EMAIL, adminPasswordConfigured: Boolean(ADMIN_PASSWORD) })"
)
new_health = """  res.json({
    ok: true,
    service: 'computer-quest-api',
    ts: new Date().toISOString(),
    adminPasswordConfigured: Boolean(ADMIN_PASSWORD),
  })"""
assert old_health in t2, 'health line not found'
t2 = t2.replace(old_health, new_health)
assert 'admin@computerquest.app' not in t2
assert 'adminEmail: ADMIN_EMAIL' not in t2
assert len(t2) > 20000
assert 'export default app' in t2
p.write_text(t2)
print('PATCHED', len(t), '->', len(t2))
