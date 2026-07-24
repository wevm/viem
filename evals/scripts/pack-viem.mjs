#!/usr/bin/env node
import { execSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const evalsDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const root = join(evalsDir, '..')
const dest = join(evalsDir, '.artifacts')

mkdirSync(dest, { recursive: true })
execSync('pnpm build', { cwd: root, stdio: 'inherit' })
const output = execSync(`pnpm pack --pack-destination "${dest}"`, {
  cwd: root,
  encoding: 'utf8',
})
const packed = output.trim().split('\n').pop()
const tarball = isAbsolute(packed) ? packed : join(dest, packed)

// Workspace lifecycle scripts break installs outside the repo; strip them like
// the publish pipeline. Rewrite the version so the package self-reports v3.
const tmp = mkdtempSync(join(tmpdir(), 'viem-pack-'))
execSync(`tar -xzf "${tarball}" -C "${tmp}"`)
const manifestPath = join(tmp, 'package/package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
delete manifest.scripts.preinstall
delete manifest.scripts.postinstall
delete manifest.scripts.prepare
const original = manifest.version
manifest.version = '3.0.0'
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
// The error-message version constant is compiled into dist at build time;
// rewrite it too so runtime errors do not self-report a 2.x version.
execSync(
  `grep -rl --include='*.js' --include='*.d.ts' '${original}' "${join(tmp, 'package')}" | xargs -r perl -pi -e 's/\\Q${original}\\E/3.0.0/g'`,
  { shell: '/bin/bash' },
)

const skill = join(dest, 'skills/viem')
rmSync(skill, { recursive: true, force: true })
mkdirSync(skill, { recursive: true })
copyFileSync(join(tmp, 'package/SKILL.md'), join(skill, 'SKILL.md'))

execSync(`tar -czf "${join(dest, 'viem.tgz')}" -C "${tmp}" package`)
rmSync(tarball)
rmSync(tmp, { recursive: true, force: true })
console.log('packed viem@3.0.0 -> evals/.artifacts/viem.tgz')
console.log('prepared Viem skill -> evals/.artifacts/skills/viem')
