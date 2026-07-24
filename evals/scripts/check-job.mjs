#!/usr/bin/env node
// Usage: check-job.mjs <job-dir> <expected-reward 0|1>
// Exits non-zero if any trial errored or scored differently than expected.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const [jobDir, expected] = process.argv.slice(2)
if (!jobDir || !['0', '1'].includes(expected)) {
  console.error('usage: check-job.mjs <job-dir> <expected-reward 0|1>')
  process.exit(2)
}

let failures = 0
let trials = 0
for (const entry of readdirSync(jobDir)) {
  const path = join(jobDir, entry, 'result.json')
  try {
    if (!statSync(join(jobDir, entry)).isDirectory()) continue
  } catch {
    continue
  }
  const result = (() => {
    try {
      return JSON.parse(readFileSync(path, 'utf8'))
    } catch {
      return undefined
    }
  })()
  if (!result) continue
  trials++
  const reward = result.verifier_result?.rewards?.reward
  const error = result.exception_info?.exception_type
  const ok = !error && reward === Number(expected)
  if (!ok) failures++
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${entry} reward=${reward ?? 'n/a'}${error ? ` error=${error}` : ''}`,
  )
}

if (trials === 0) {
  console.error('no trials found')
  process.exit(2)
}
process.exit(failures === 0 ? 0 : 1)
