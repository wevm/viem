// Runs `vocs build` with static generation deferred, then generates static pages in a
// fresh process. Bundler memory from the Vite build is released before static
// generation starts, keeping peak memory within the Vercel build machine.
import { spawnSync } from 'node:child_process'
import { mkdirSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const cacheDir = path.join(root, 'node_modules/.cache')
mkdirSync(cacheDir, { recursive: true })
const deferFile = path.join(cacheDir, 'waku-ssg.json')

const { status } = spawnSync('vocs', ['build', ...process.argv.slice(2)], {
  cwd: root,
  env: { ...process.env, WAKU_SSG_DEFER_FILE: deferFile },
  shell: true,
  stdio: 'inherit',
})
if (status !== 0) process.exit(status ?? 1)

// Waku is a dependency of Vocs, so resolve it from there.
const vocsDir = realpathSync(path.join(root, 'node_modules/vocs'))
const require = createRequire(path.join(vocsDir, 'package.json'))
const wakuDir = path.dirname(require.resolve('waku/package.json'))
const { runDeferredStaticBuild } = await import(
  pathToFileURL(path.join(wakuDir, 'dist/lib/vite-plugins/static-build.js'))
    .href
)
// Match the environment Vite sets for the in-process build.
process.env.NODE_ENV ??= 'production'
await runDeferredStaticBuild(deferFile)
