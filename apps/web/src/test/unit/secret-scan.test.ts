import { describe, expect, it } from 'vitest'
import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Working-tree secret scan. Fails if a JWT-shaped literal is committed.
 * Matches are reported as file:line plus a redacted marker — never the value.
 */
const JWT_LITERAL = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'out',
  'build',
  '.turbo',
  '.vercel',
  'coverage',
])

const MAX_BYTES = 10 * 1024 * 1024

function findRepoRoot(start: string): string {
  let dir = start
  for (let i = 0; i < 8; i++) {
    const pkgPath = path.join(dir, 'package.json')
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string }
      if (pkg.name === 'hirrd') return dir
    } catch {
      // keep walking
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(`hirrd repo root not found from ${start}`)
}

function isIgnoredEnvFile(name: string): boolean {
  if (name === '.env' || name === '.env.local') return true
  return name.startsWith('.env.') && name.endsWith('.local')
}

function collectJwtHits(root: string): string[] {
  const hits: string[] = []

  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name) || isIgnoredEnvFile(name)) continue
      const full = path.join(dir, name)
      const st = lstatSync(full)
      if (st.isSymbolicLink()) continue
      if (st.isDirectory()) {
        walk(full)
        continue
      }
      if (!st.isFile() || st.size > MAX_BYTES) continue
      const buf = readFileSync(full)
      if (buf.includes(0)) continue
      const lines = buf.toString('utf8').split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        if (JWT_LITERAL.test(lines[i])) {
          const rel = path.relative(root, full).split(path.sep).join('/')
          hits.push(`${rel}:${i + 1} eyJ…[REDACTED]`)
        }
      }
    }
  }

  walk(root)
  return hits
}

describe('secret scan', () => {
  it('working tree has no JWT-shaped literals', () => {
    const root = findRepoRoot(process.cwd())
    const hits = collectJwtHits(root)
    expect(hits, hits.join('\n')).toEqual([])
  })
})
