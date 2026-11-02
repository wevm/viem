// Syncs the AI search index in its own process before `vocs build --no-embeddings`,
// so embedding work never shares memory with bundling and static generation.
// Skipped when AI search is disabled (no Cloudflare credentials, or no index for
// this deployment).
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
} catch {}

if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
  console.log(
    '[embeddings] Cloudflare credentials not set; skipping AI search index.',
  )
  process.exit(0)
}

const { status, stderr } = spawnSync('vocs', ['embeddings', 'generate'], {
  encoding: 'utf8',
  shell: true,
  stdio: ['inherit', 'inherit', 'pipe'],
})
process.stderr.write(stderr ?? '')
if (status !== 0 && stderr?.includes('is not enabled in your config')) {
  console.log(
    '[embeddings] AI search is disabled for this deployment; skipping.',
  )
  process.exit(0)
}
process.exit(status ?? 1)
