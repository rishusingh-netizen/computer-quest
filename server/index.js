import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pathToFileURL } from 'url'
import p0 from './cq_part_0.js'
import p1 from './cq_part_1.js'
import p2 from './cq_part_2.js'
import p3 from './cq_part_3.js'

const code = [p0, p1, p2, p3].join('')
const tmp = join(tmpdir(), 'cq-assembled-' + process.pid + '.mjs')
writeFileSync(tmp, code)
const mod = await import(pathToFileURL(tmp).href)
try { unlinkSync(tmp) } catch {}
export default mod.default
