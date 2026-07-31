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
import { join } from 'node:path'

/** Buckets a probe's diagnostics are classified into. */
type Category = 'nonportable' | 'tooLarge' | 'depth' | 'other' | 'library'

/** Diagnostic counts for one `tsc` invocation. */
type Tally = Record<Category, number> & { total: number }

/** Gate outcome for one probe, as recorded in `results.json`. */
type Result = Tally & {
  emitted: boolean
  forbidden: string[]
  downstream?: number
}

const dir = import.meta.dirname
const repo = join(dir, '..', '..', '..')
const probesDir = join(dir, 'probes')
const resultsPath = join(dir, 'results.json')

/**
 * Failures the gate currently tolerates, as diagnostic counts per probe. Shrink-only:
 * when a fix lands and a probe improves, delete or shrink its entry. Everything absent
 * from this map must produce zero diagnostics, emit a declaration, and contain no
 * forbidden paths.
 */
const expectedFailures: Record<
  string,
  Partial<Omit<Result, 'emitted' | 'forbidden'>>
> = {
  // `ox/erc4337`'s `UserOperation` types are `OneOf<...>` instantiations, re-exported
  // through `src/erc4337/internal/inference.ts` via `ox/_types/*`. Blocked on an `ox`
  // patch release: 1.3.0 published without the `_types` subpath (its `postinstall`
  // regenerates `exports` without it).
  'erc4337-bundler': { nonportable: 2 },
  // `Contract.from` over a ~40-entry ABI exceeds the declaration serializer limit
  // (TS7056), extended client or not; the Contract type needs nominal boundaries so
  // emit references it instead of expanding per-function members.
  'stress-contract-abi': { tooLarge: 1 },
}
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
const categories: Record<string, Category> = {
  TS2742: 'nonportable', // inferred type cannot be named (TypeScript 5.x/6.x)
  TS2883: 'nonportable', // same diagnostic, renumbered on TypeScript 7
  TS7056: 'tooLarge', // inferred type too large to serialize
  TS2321: 'depth', // excessive stack depth comparing types
  TS2589: 'depth', // type instantiation is excessively deep
  TS2590: 'depth', // union type too complex to represent
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

const results: Record<string, Result> = {}
for (const probe of readdirSync(probesDir)
  .filter((file) => file.endsWith('.ts'))
  .sort())
  results[probe.replace(/\.ts$/, '')] = check(probe.replace(/\.ts$/, ''))

report(results)

function setup(): void {
  // Every probe depends on `viem/_types/*` existing; without it the failures point
  // everywhere except the real cause. `ox` 1.3.0 shipped without its equivalent this
  // way (`postinstall` regenerates `exports` without it).
  const manifest = JSON.parse(
    readFileSync(join(repo, 'package.json'), 'utf8'),
  ) as { exports?: Record<string, unknown> }
  if (!manifest.exports?.['./_types/*'])
    throw new Error(
      "package.json is missing the './_types/*' export. Run `pnpm build`; the `exports:internal-types` step writes it.",
    )

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

function check(name: string): Result {
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

  const tally_ = tally(compile(join(workDir, 'tsconfig.json')))

  // TypeScript skips emit entirely when declaration emit fails, so the checks below
  // only apply once a probe compiles. `emitted` keeps that distinction in the results
  // rather than recording an empty `forbidden` list for a probe that produced nothing.
  const declaration = read(join(workDir, `${name}.d.ts`))
  const result: Result = {
    ...tally_,
    emitted: declaration !== undefined,
    forbidden: declaration
      ? forbidden.filter((pattern) => declaration.includes(pattern))
      : [],
  }

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

function compile(project: string): string[] {
  try {
    // `cwd` fixes the base that tsc reports diagnostic paths against.
    execFileSync(tsc, ['-p', project, '--pretty', 'false'], {
      cwd: consumer,
      encoding: 'utf8',
    })
    return []
  } catch (error) {
    // A non-zero exit is the expected path while failures exist; the diagnostics we
    // want are on stdout. Anything else — including a checker stack-overflow crash,
    // which exits non-zero with empty stdout — means tsc itself could not run.
    const { stdout } = error as { stdout?: string }
    if (!stdout) throw error
    return stdout.split('\n').filter(Boolean)
  }
}

function tally(lines: string[]): Tally {
  const result: Tally = {
    nonportable: 0,
    tooLarge: 0,
    depth: 0,
    other: 0,
    library: 0,
    total: 0,
  }
  for (const line of lines) {
    const groups = diagnostic.exec(line)?.groups
    if (!groups) continue
    result.total += 1
    // A diagnostic raised inside a dependency's declarations is a different failure
    // from one raised on the probe's exported value; keep them apart.
    if (!/(^|\/)probes\/[^/]+\.ts$/.test(groups.file)) {
      result.library += 1
      continue
    }
    result[categories[groups.code] ?? 'other'] += 1
  }
  return result
}

function read(path: string): string | undefined {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return undefined
  }
}

function write(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

function report(results: Record<string, Result>): void {
  console.log(summary(results))

  // Debugging artifact only (gitignored): the expectation is zero diagnostics
  // everywhere, minus `expectedFailures`.
  write(resultsPath, results)

  const failures: string[] = []
  const counts = [
    'nonportable',
    'tooLarge',
    'depth',
    'other',
    'library',
    'downstream',
  ] as const

  for (const [name, result] of Object.entries(results)) {
    const expected = expectedFailures[name]
    for (const key of counts) {
      const actual = result[key] ?? 0
      const allowed = expected?.[key] ?? 0
      if (actual > allowed)
        failures.push(`${name}: ${key} regressed, ${allowed} -> ${actual}`)
      if (actual < allowed)
        failures.push(
          `${name}: ${key} improved, ${allowed} -> ${actual}. Shrink its expectedFailures entry.`,
        )
    }
    // A probe expected to fail cannot emit, so the output checks only apply to
    // clean probes.
    if (expected) continue
    if (!result.emitted)
      failures.push(`${name}: declaration emit produced no output`)
    if (result.forbidden.length)
      failures.push(
        `${name}: forbidden path(s) in output: ${result.forbidden.join(', ')}`,
      )
  }

  for (const name of Object.keys(expectedFailures))
    if (!results[name])
      failures.push(`${name}: expectedFailures entry has no probe`)

  if (failures.length) {
    console.error(`\n${failures.length} portability check failure(s):`)
    for (const failure of failures) console.error(`  ${failure}`)
    console.error(
      '\nFull results: environments/tsc/declaration/results.json (gitignored).',
    )
    process.exit(1)
  }
  console.log('\nDeclaration portability matches expectations.')
}

function summary(results: Record<string, Result>): string {
  const version = execFileSync(tsc, ['--version'], { encoding: 'utf8' }).trim()
  const rows = Object.entries(results).map(([name, result]) => {
    const status = result.total === 0 ? 'pass' : 'fail'
    return `  ${status}  ${name.padEnd(20)} nonportable=${result.nonportable} tooLarge=${result.tooLarge} depth=${result.depth} other=${result.other} library=${result.library} downstream=${result.downstream ?? 0}`
  })
  const total = Object.values(results).reduce((sum, r) => sum + r.total, 0)
  return [version, ...rows, `  total diagnostics: ${total}`].join('\n')
}
