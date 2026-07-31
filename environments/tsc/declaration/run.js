// Declaration portability gate.
//
// A consumer that re-exports an inferred Viem value must be able to emit its own
// `.d.ts`. When a type in the inferred graph has no portable public name, TypeScript
// reports TS2742 (TS2883 on TypeScript 7) and the consumer is forced to hand-annotate.
// Nothing else in CI observes this: `check:types` never emits declarations, and
// publint/attw inspect packaging rather than downstream inference.
//
// Viem is packed and installed into a throwaway consumer rather than linked from the
// workspace. A workspace link cannot model this correctly: it resolves Viem to the repo
// root, which sits outside any `node_modules`, so TypeScript cannot derive a package
// name for Viem's own files. Setting `preserveSymlinks` fixes that but then stops
// TypeScript reaching `ox`'s dependencies through pnpm's store, which silently hides
// every `ox` portability failure instead of reporting it.
//
// Each probe compiles on its own. Compiling them together would let one probe's imports
// make a hidden symbol nameable and mask a real failure in another.
//
// `tsc` is driven through its CLI, and through the *repository's* install rather than
// the consumer's, so the version the `types` CI matrix pins is the version under test.
// TypeScript 7's native compiler also does not expose the classic JavaScript API.

import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const repo = join(dir, '..', '..', '..')
const probesDir = join(dir, 'probes')
const baselinePath = join(dir, 'baseline.json')
// `realpathSync` matters: on macOS `tmpdir()` is a symlink, and passing the unresolved
// path as `cwd` makes tsc report every diagnostic through a long `../../..` prefix.
const consumer = join(realpathSync(tmpdir()), 'viem-declaration-consumer')
const tsc = join(repo, 'node_modules', '.bin', 'tsc')

/** Mirrors what a published consumer compiles with. */
const compilerOptions = {
  declaration: true,
  emitDeclarationOnly: true,
  module: 'nodenext',
  moduleResolution: 'nodenext',
  /* Viem's own declarations must be checked; skipping them hides the failure. */
  skipLibCheck: false,
  strict: true,
  target: 'esnext',
  types: [],
  verbatimModuleSyntax: true,
}

/** Diagnostics we expect while the type surface is still being fixed. */
const categories = {
  TS2742: 'nonportable', // inferred type cannot be named (TypeScript 5.x/6.x)
  TS2883: 'nonportable', // same diagnostic, renumbered on TypeScript 7
  TS7056: 'tooLarge', // inferred type too large to serialize
}

/**
 * Substrings that must never appear in an emitted consumer declaration. Each one means
 * the declaration only resolves on the machine that produced it.
 */
const forbidden = [
  '.pnpm',
  'node_modules',
  'viem/dist',
  'viem/src',
  "from 'ox/",
  'from "ox/',
  "from 'abitype'",
  'from "abitype"',
]

const diagnostic = /^(?<file>.+)\((?<line>\d+),\d+\): error (?<code>TS\d+):/

setup()

const results = {}
for (const probe of readdirSync(probesDir)
  .filter((f) => f.endsWith('.ts'))
  .sort())
  results[probe.replace(/\.ts$/, '')] = check(probe.replace(/\.ts$/, ''))

report(results)

function setup() {
  // Packing and installing costs ~15s. REUSE_CONSUMER skips it while iterating on
  // probes; never set it in CI, where the tarball is the thing under test.
  if (
    process.env.REUSE_CONSUMER &&
    existsSync(join(consumer, 'node_modules', 'viem'))
  ) {
    cpSync(probesDir, join(consumer, 'probes'), { recursive: true })
    return
  }

  rmSync(consumer, { force: true, recursive: true })
  const packDir = join(consumer, '.pack')
  mkdirSync(packDir, { recursive: true })

  execFileSync('pnpm', ['pack', '--pack-destination', packDir], {
    cwd: repo,
    stdio: 'pipe',
  })
  const tarball = readdirSync(packDir).find((file) => file.endsWith('.tgz'))
  if (!tarball) throw new Error('pnpm pack produced no tarball')

  write(join(consumer, 'package.json'), {
    name: 'viem-declaration-consumer',
    private: true,
    type: 'module',
    // Only Viem. A real consumer has no direct dependency on `ox` or `abitype`, which
    // is exactly why types reaching those packages are unnameable downstream.
    dependencies: { viem: `file:${join(packDir, tarball)}` },
  })
  execFileSync('pnpm', ['install', '--ignore-scripts', '--no-lockfile'], {
    cwd: consumer,
    stdio: 'pipe',
  })

  cpSync(probesDir, join(consumer, 'probes'), { recursive: true })
}

function check(name) {
  const workDir = join(consumer, 'out', name)
  mkdirSync(workDir, { recursive: true })
  write(join(workDir, 'tsconfig.json'), {
    include: [`../../probes/${name}.ts`],
    compilerOptions: {
      ...compilerOptions,
      outDir: '.',
      rootDir: '../../probes',
    },
  })

  const result = tally(compile(join(workDir, 'tsconfig.json')))

  // TypeScript skips emit entirely when declaration emit fails, so the checks below
  // only apply once a probe compiles. `emitted` keeps that distinction in the baseline
  // rather than recording an empty `forbidden` list for a probe that produced nothing.
  const declaration = read(join(workDir, `${name}.d.ts`))
  result.emitted = declaration !== undefined
  result.forbidden = declaration
    ? forbidden.filter((pattern) => declaration.includes(pattern))
    : []

  // Second hop: a declaration can emit and still be unusable downstream. Compile it
  // from a consumer that depends on Viem but not on `ox` or `abitype`.
  if (declaration) {
    const downstreamDir = join(workDir, 'downstream')
    mkdirSync(downstreamDir, { recursive: true })
    writeFileSync(
      join(downstreamDir, 'index.ts'),
      `export * from '../${name}.js'\n`,
    )
    write(join(downstreamDir, 'tsconfig.json'), {
      include: ['index.ts'],
      compilerOptions: {
        ...compilerOptions,
        emitDeclarationOnly: false,
        noEmit: true,
      },
    })
    result.downstream = tally(
      compile(join(downstreamDir, 'tsconfig.json')),
    ).total
  }

  return result
}

function compile(project) {
  try {
    // `cwd` fixes the base that tsc reports diagnostic paths against.
    execFileSync(tsc, ['-p', project, '--pretty', 'false'], {
      cwd: consumer,
      encoding: 'utf8',
    })
    return []
  } catch (error) {
    // A non-zero exit is the expected path while failures exist; the diagnostics we
    // want are on stdout. Anything else means tsc itself could not run.
    if (error.stdout === undefined) throw error
    return error.stdout.split('\n').filter(Boolean)
  }
}

function tally(lines) {
  const result = { nonportable: 0, tooLarge: 0, other: 0, library: 0, total: 0 }
  for (const line of lines) {
    const match = diagnostic.exec(line)
    if (!match) continue
    result.total += 1
    // A diagnostic raised inside a dependency's declarations is a different failure
    // from one raised on the probe's exported value; keep them apart.
    if (!/(^|\/)probes\/[^/]+\.ts$/.test(match.groups.file)) {
      result.library += 1
      continue
    }
    result[categories[match.groups.code] ?? 'other'] += 1
  }
  return result
}

function read(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return undefined
  }
}

function write(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

function report(results) {
  console.log(summary(results))

  if (process.env.UPDATE_BASELINE) {
    write(baselinePath, results)
    console.log(`\nWrote baseline for ${Object.keys(results).length} probes.`)
    return
  }

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
  const failures = []
  const counts = ['nonportable', 'tooLarge', 'other', 'library', 'downstream']

  for (const [name, result] of Object.entries(results)) {
    const expected = baseline[name]
    if (!expected) {
      failures.push(`${name}: probe is not in the baseline`)
      continue
    }
    for (const key of counts) {
      const actual = result[key] ?? 0
      const before = expected[key] ?? 0
      if (actual > before)
        failures.push(`${name}: ${key} regressed, ${before} -> ${actual}`)
      if (actual < before)
        failures.push(`${name}: ${key} improved, ${before} -> ${actual}`)
    }
    if (result.emitted !== expected.emitted)
      failures.push(
        `${name}: declaration emit ${result.emitted ? 'started' : 'stopped'} producing output`,
      )
    const added = result.forbidden.filter(
      (p) => !expected.forbidden.includes(p),
    )
    const removed = expected.forbidden.filter(
      (p) => !result.forbidden.includes(p),
    )
    if (added.length)
      failures.push(
        `${name}: new forbidden path(s) in output: ${added.join(', ')}`,
      )
    if (removed.length)
      failures.push(`${name}: forbidden path(s) gone: ${removed.join(', ')}`)
  }

  for (const name of Object.keys(baseline))
    if (!results[name])
      failures.push(`${name}: baselined probe no longer exists`)

  if (failures.length) {
    console.error(`\n${failures.length} portability check failure(s):`)
    for (const failure of failures) console.error(`  ${failure}`)
    console.error(
      '\nIf these are improvements, re-run with UPDATE_BASELINE=1 to lock them in.',
    )
    process.exit(1)
  }
  console.log('\nDeclaration portability matches the baseline.')
}

function summary(results) {
  const version = execFileSync(tsc, ['--version'], { encoding: 'utf8' }).trim()
  const rows = Object.entries(results).map(([name, result]) => {
    const status = result.total === 0 ? 'pass' : 'fail'
    return `  ${status}  ${name.padEnd(20)} nonportable=${result.nonportable} tooLarge=${result.tooLarge} other=${result.other} library=${result.library} downstream=${result.downstream ?? 0}`
  })
  const total = Object.values(results).reduce((sum, r) => sum + r.total, 0)
  return [version, ...rows, `  total diagnostics: ${total}`].join('\n')
}
