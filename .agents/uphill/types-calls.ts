/**
 * Writes the type-checking cost of calling each public function the way viem's own tests call it,
 * and whether each public function has such a call.
 *
 * 1. Enumerate. `speed-worker.ts enumerate` lists the public functions the way the speed and
 *    coverage categories do: every function each entry point of src/package.json exports,
 *    namespace members included, such as `viem/tempo:Actions.token.transfer`, named by the first
 *    entry in src/package.json order. A worker walks each name from its entry's source to the
 *    declaration it resolves to.
 * 2. Scan. Workers list the calls in every `*.test.ts` and `*.test-d.ts` file under src whose
 *    callee resolves, through imports and re-exports, to one of those declarations. Calls through
 *    a client, such as `client.readContract(...)`, are the decorator's, so they do not count.
 * 3. Measure. Each function gets one call: the first in its own runtime tests, such as
 *    readContract.test.ts for readContract, else in its own type tests, else in any test file.
 *    types-calls-worker.ts copies the call out of its statement and checks it in a fresh checker
 *    after resolving what it references from outside it, so imports and fixtures, such as a large
 *    ABI or a client's own type, do not count against it. Relating a fixture to the function's
 *    parameters does count: that is checking the call. For a costly call that passes a client
 *    first, the note says how much of the cost the client argument accounts for alone.
 *
 * - `instantiations`: type instantiations to check the call, exact and repeatable.
 * - `type-benched`: whether the function has a measured call, and why not when it has none.
 *
 * Check time and heap bytes are not written. They could be measured over the same window, but the
 * same call's time varied by a third between checks, and a time or a varying size would make
 * Uphill run this script five times. `UPHILL_CONCURRENCY` sets the pool size (default
 * `os.availableParallelism()`), which free memory caps.
 *
 * @module
 */

import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import type {
  EntriesResult,
  Job,
  Measurement,
  MeasureResult,
  ScanResult,
  Site,
} from './types-calls-worker.ts'

/**
 * Each worker's V8 heap limit in MB, and the larger one a job that runs out of it gets. The parsed
 * sources take about 500MB, and checking a Tempo call with its client about 500MB more.
 */
const heap = 1536
const largeHeap = 4096
/** The resident memory one worker can reach, which caps the pool by free memory. */
const workerBytes = 1.75e9
/** Notes say where the instantiations come from for calls that cost at least this many. */
const costly = 5000
/** Calls tried per function until one checks once copied out. */
const tries = 5

const root = process.cwd()
const here = import.meta.dir
const metrics = process.env.UPHILL_METRICS
if (!metrics) throw new Error('UPHILL_METRICS is not set')
const started = performance.now()

// 1. The public functions, named as the speed and coverage categories name them.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uphill-types-calls-'))
const enumeration = (() => {
  try {
    fs.writeFileSync(path.join(tmp, 'keys.json'), JSON.stringify({ keys: [] }))
    const result = Bun.spawnSync(
      [
        'node',
        path.join(here, 'speed-worker.ts'),
        'enumerate',
        path.join(tmp, 'keys.json'),
        path.join(tmp, 'enumeration.json'),
      ],
      { cwd: root, stderr: 'inherit' },
    )
    if (!result.success) throw new Error('enumerating public functions failed')
    return JSON.parse(
      fs.readFileSync(path.join(tmp, 'enumeration.json'), 'utf8'),
    ) as {
      items: { name: string; entry: string; package?: string | undefined }[]
      entries: { name: string; file: string }[]
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})()
const functions = enumeration.items
const entries = enumeration.entries.map(({ name, file }) => ({
  name,
  file: file
    .replace(`${path.sep}_esm${path.sep}`, path.sep)
    .replace(/\.js$/, '.ts'),
}))
const testFiles = [...new Bun.Glob('src/**/*.{test,test-d}.ts').scanSync(root)]
  .filter((file) => !/(^|\/)_(esm|cjs|types)\//.test(file))
  .sort()
  .map((file) => path.join(root, file))
log(
  `${functions.length} public functions; scanning ${testFiles.length} test files for calls`,
)

// 2. Resolve each function to its declarations, and scan every test file for calls.
const concurrency = Math.max(
  1,
  Math.min(
    Number(process.env.UPHILL_CONCURRENCY) || os.availableParallelism(),
    Math.floor(os.freemem() / workerBytes),
  ),
)
const workers = Array.from({ length: concurrency }, () => startWorker(heap))
let nextId = 0
const declarations = new Map<string, string>()
const sitesByFile = new Map<string, Site[]>()
const texts = new Map<string, string>()
let missing: string[] = []
await run([
  {
    job: {
      kind: 'entries',
      id: nextId++,
      entries,
      names: functions.map((item) => item.name),
    },
    done(result: EntriesResult) {
      for (const [name, keys] of Object.entries(result.declarations))
        for (const key of keys)
          if (!declarations.has(key)) declarations.set(key, name)
      missing = result.missing
    },
  },
  ...testFiles.map((file) => ({
    job: { kind: 'scan' as const, id: nextId++, file },
    done(result: ScanResult) {
      sitesByFile.set(result.file, result.sites)
      texts.set(result.file, result.text)
    },
  })),
])
if (missing.length)
  log(
    `${missing.length} public functions did not resolve to a declaration, such as ${missing.slice(0, 3).join(', ')}`,
  )

type Candidate = Site & { file: string; item: string }
const candidates = new Map<string, Candidate[]>()
let callCount = 0
// In file order, since scans finish in any order.
for (const file of [...sitesByFile.keys()].sort())
  for (const site of sitesByFile.get(file)!) {
    const item = declarations.get(site.declaration)
    if (!item) continue
    callCount++
    const list = candidates.get(item) ?? []
    list.push({ ...site, file, item })
    candidates.set(item, list)
  }
log(
  `found ${callCount} calls to ${candidates.size} public functions in ${((performance.now() - started) / 1000).toFixed(1)}s`,
)

// 3. Measure one call per function: the first in its own runtime tests, such as
// readContract.test.ts for readContract, then in its own type tests, then in any other test file.
// That is most often the test named `default`, the way its documentation calls it. A call that
// fails to check once copied out gives its place to the function's next call, up to five calls.
const order = new Map<string, Candidate[]>()
for (const [item, list] of candidates) {
  const rank = (candidate: Candidate) => {
    const declared = path
      .basename(candidate.declaration.split(':')[0]!)
      .replace(/(\.d)?\.ts$/, '')
    const name = path.basename(candidate.file)
    if (name === `${declared}.test.ts`) return 0
    if (name === `${declared}.test-d.ts`) return 1
    return 2
  }
  order.set(
    item,
    list
      .filter((candidate) => !candidate.skip)
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) ||
          a.start - b.start,
      ),
  )
}

const timesFile = path.join(os.tmpdir(), 'uphill-viem-types-calls-times.json')
const lastTimes: Record<string, number> = fs.existsSync(timesFile)
  ? JSON.parse(fs.readFileSync(timesFile, 'utf8'))
  : {}
const times: Record<string, number> = {}
const measured = new Map<string, Measurement & { candidate: Candidate }>()
const rejected = new Map<string, (Measurement & { candidate: Candidate })[]>()
const tried = new Map<string, number>()
for (let round = 1; ; round++) {
  const chosen: Candidate[] = []
  for (const [item, list] of order) {
    const next = tried.get(item) ?? 0
    if (measured.has(item) || next >= Math.min(list.length, tries)) continue
    chosen.push(list[next]!)
    tried.set(item, next + 1)
  }
  if (!chosen.length) break
  const byFile = Map.groupBy(chosen, (candidate) => candidate.file)
  log(
    `measuring ${chosen.length} calls in ${byFile.size} test files (round ${round})`,
  )
  // The costliest files first, so the slowest job does not run alone at the end. The last run's
  // times order the queue, then the number of calls; they only decide the order, never a value.
  const jobs = [...byFile].sort(
    (a, b) =>
      (lastTimes[b[0]] ?? Number.POSITIVE_INFINITY) -
        (lastTimes[a[0]] ?? Number.POSITIVE_INFINITY) ||
      b[1].length - a[1].length,
  )
  await run(
    jobs.map(([file, list]) => ({
      job: {
        kind: 'measure' as const,
        id: nextId++,
        file,
        text: texts.get(file)!,
        sites: list.map((candidate, site) => ({
          site,
          start: candidate.start,
          end: candidate.end,
          outer: candidate.outer,
          anchor: candidate.anchor,
        })),
        probeAbove: costly,
      },
      done(result: MeasureResult) {
        for (const measurement of result.measurements) {
          const candidate = list[measurement.site]!
          if (!measurement.errors.length)
            measured.set(candidate.item, { ...measurement, candidate })
          else
            rejected.set(candidate.item, [
              ...(rejected.get(candidate.item) ?? []),
              { ...measurement, candidate },
            ])
        }
      },
    })),
  )
}
const peak = Math.max(
  ...(await Promise.all(workers.map((worker) => worker.close()))),
)
fs.writeFileSync(`${timesFile}.${process.pid}`, JSON.stringify(times))
fs.renameSync(`${timesFile}.${process.pid}`, timesFile)

// 4. Lines: one value per measured function, and one check per public function.
const lines: string[] = []
const reasons = new Map<string, number>()
const reported: { item: string; value: number; note: string }[] = []
for (const { name, package: owner } of functions) {
  const measurement = measured.get(name)
  if (measurement) {
    const text = note(measurement)
    lines.push(
      `instantiations ${quote(name)} ${measurement.instantiations} note ${quote(text)}`,
      `type-benched ${quote(name)} pass note ${quote(where(measurement.candidate))}`,
    )
    reported.push({ item: name, value: measurement.instantiations, note: text })
    continue
  }
  const reason = whyNot(name, owner)
  reasons.set(
    reason.split(/[:(]/)[0]!.trim(),
    (reasons.get(reason.split(/[:(]/)[0]!.trim()) ?? 0) + 1,
  )
  lines.push(`type-benched ${quote(name)} fail note ${quote(reason)}`)
}
fs.appendFileSync(metrics, `${lines.join('\n')}\n`)

log(
  `measured ${reported.length} of ${functions.length} public functions; not measured: ${[
    ...reasons,
  ]
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${count} ${reason}`)
    .join(', ')}`,
)
log('costliest calls:')
for (const { item, value, note } of reported
  .toSorted((a, b) => b.value - a.value)
  .slice(0, 25))
  log(`  ${value} ${item}: ${note}`)
log(
  `done in ${((performance.now() - started) / 1000).toFixed(1)}s with ${concurrency} workers; peak worker memory ${size(peak)}`,
)

/** Names a call's test, such as `src/actions/public/readContract.test.ts > wagmi > default`. */
function where(candidate: Candidate) {
  return `${candidate.test} (line ${candidate.line})`
}

/** The call's test and, for a costly one, which part of checking it the instantiations come from. */
function note(measurement: Measurement & { candidate: Candidate }) {
  const { candidate, parts, instantiations, signature, client } = measurement
  const text = [where(candidate)]
  if (candidate.chain)
    text.push(`with ${candidate.chain} chained on its result`)
  if (instantiations < costly) return text.join('; ')
  const share = (count: number) =>
    `${Math.min(100, Math.round((count / instantiations) * 100))}%`
  const declared = (parameters: string[]) => short(`(${parameters.join(', ')})`)
  if (client) {
    // What the call costs beyond its client: its other arguments, and the types they decide.
    const rest = instantiations - client.instantiations
    text.push(
      client.instantiations >= rest
        ? `${share(client.instantiations)} of instantiations come from inferring from and checking its client argument (${short(client.first)}) alone`
        : `${share(rest)} of instantiations come from its arguments after the client, declared as ${declared(signature.parameters.slice(1))}`,
    )
    return text.join('; ')
  }
  const [count, description] = (
    [
      [
        parts.call,
        `inferring its type arguments and checking its arguments against ${declared(signature.parameters)}`,
      ],
      [
        parts.result,
        candidate.chain
          ? 'its return type and the calls chained on it'
          : `its return type${signature.returns ? `, declared as ${short(signature.returns)}` : ''}`,
      ],
      [parts.awaited, 'awaiting its result'],
    ] as const
  ).toSorted((a, b) => b[0] - a[0])[0]!
  text.push(`${share(count)} of instantiations come from ${description}`)
  return text.join('; ')
}

/** Why a public function has no measured call. */
function whyNot(name: string, owner: string | undefined) {
  if (missing.includes(name))
    return 'no declaration names it, since it is built at run time'
  const all = candidates.get(name) ?? []
  if (!all.length)
    return owner
      ? `no test calls it directly (it is ${owner}'s)`
      : 'no test calls it directly'
  const failed = rejected.get(name) ?? []
  if (failed.length) {
    const first = failed[0]!
    const error = first.errors[0]!
    return `every call measured fails to check once copied out of its statement: TS${error.code} ${error.message} (${where(first.candidate)})`
  }
  const counts = new Map<string, number>()
  for (const candidate of all)
    if (candidate.skip) {
      const reason = candidate.skip.replace(/naming \S+,/, 'naming a variable')
      counts.set(reason, (counts.get(reason) ?? 0) + 1)
    }
  return `every call in the tests is unmeasurable: ${[...counts]
    .sort((a, b) => b[1] - a[1])
    .map(
      ([reason, count]) =>
        `${count} ${count === 1 ? 'call' : 'calls'} ${reason}`,
    )
    .join(', ')} (such as ${where(all[0]! as Candidate)})`
}

/** Shortens a declared type for a note to its first 100 characters. */
function short(text: string) {
  const flat = text.replace(/\s+/g, ' ')
  return flat.length > 100 ? `${flat.slice(0, 99)}…` : flat
}

/**
 * Runs jobs on the pool, each worker taking the next job as it finishes one. A worker that runs
 * out of memory is replaced, and its job runs again in a worker with a larger heap.
 */
async function run(tasks: { job: Job; done: (result: never) => void }[]) {
  let next = 0
  let finished = 0
  await Promise.all(
    workers.map(async (_, index) => {
      while (next < tasks.length) {
        const task = tasks[next++]!
        const begun = performance.now()
        let result: unknown
        try {
          result = await workers[index]!.send(task.job)
        } catch (error) {
          log(`${String(error)}; checking it again with a ${largeHeap}MB heap`)
          workers[index] = startWorker(heap)
          const large = startWorker(largeHeap)
          result = await large.send(task.job)
          await large.close()
        }
        task.done(result as never)
        if (task.job.kind === 'measure')
          times[task.job.file] =
            (times[task.job.file] ?? 0) + performance.now() - begun
        if (++finished % 100 === 0)
          log(
            `${finished} of ${tasks.length} jobs done after ${((performance.now() - started) / 1000).toFixed(0)}s`,
          )
      }
    }),
  )
}

/** Starts one Node worker process, which takes one job at a time. */
function startWorker(limit: number) {
  const child = Bun.spawn(
    [
      'node',
      `--max-old-space-size=${limit}`,
      path.join(here, 'types-calls-worker.ts'),
    ],
    { cwd: root, stdin: 'pipe', stdout: 'pipe', stderr: 'inherit' },
  )
  const reader = child.stdout.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  const readLine = async (): Promise<string | undefined> => {
    for (;;) {
      const newline = buffer.indexOf('\n')
      if (newline >= 0) {
        const line = buffer.slice(0, newline)
        buffer = buffer.slice(newline + 1)
        return line
      }
      const { value, done } = await reader.read()
      if (done) return undefined
      buffer += value
    }
  }
  return {
    async send(job: Job): Promise<unknown> {
      child.stdin.write(`${JSON.stringify(job)}\n`)
      child.stdin.flush()
      const line = await readLine()
      if (line === undefined) {
        const status = await child.exited
        throw new Error(
          `a worker exited with status ${status} on ${'file' in job ? path.relative(root, job.file) : job.kind}`,
        )
      }
      return JSON.parse(line)
    },
    async close(): Promise<number> {
      child.stdin.end()
      const line = await readLine()
      await child.exited
      return line ? (JSON.parse(line) as { peak: number }).peak : 0
    },
  }
}

/** Quotes an item or note for a metric line, escaping `"` and `\`. */
function quote(text: string): string {
  return `"${text.replace(/\s+/g, ' ').replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

/** Formats bytes in decimal units. */
function size(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)}GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)}MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)}kB`
  return `${bytes}B`
}

function log(message: string) {
  process.stderr.write(`${message}\n`)
}
