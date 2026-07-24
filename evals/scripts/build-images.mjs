#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const evalsDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const tarball = join(evalsDir, '.artifacts/viem.tgz')
if (!existsSync(tarball))
  throw new Error(
    'missing evals/.artifacts/viem.tgz; run scripts/pack-viem.mjs first',
  )

const forkArgs = process.env.EVALS_FORK_URL
  ? `--build-arg FORK_URL=${process.env.EVALS_FORK_URL}`
  : ''

copyFileSync(tarball, join(evalsDir, 'base/viem.tgz'))
execSync('docker build -t viem-evals-base .', {
  cwd: join(evalsDir, 'base'),
  stdio: 'inherit',
})
execSync(`docker build ${forkArgs} -t viem-evals-anvil .`, {
  cwd: join(evalsDir, 'base/anvil'),
  stdio: 'inherit',
})
