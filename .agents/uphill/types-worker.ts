/**
 * Checks consumer files one at a time, each in a fresh `ts.Program` with a fresh checker, and
 * reports what each check cost. types.ts starts a pool of these in Node and sends one job per line
 * on standard input; each result goes back as one line on standard output.
 *
 * - Instantiations: `program.getInstantiationCount()`, exact and repeatable.
 * - CPU time: the main thread's CPU time while the checker checks the file. Node's own counters
 *   tick in 4ms steps, so the time comes from the scheduler's nanosecond count instead.
 * - Memory: the bytes V8 allocates on its heap during the check, from `total_allocated_bytes`.
 *
 * Each job carries a baseline file: the same imports and nothing else. A program for the baseline,
 * never checked, is the old program each measured program reuses, so creating a program costs
 * almost nothing once the files are parsed. The baseline's own check is measured 5 times, and the
 * results carry its median, which types.ts subtracts.
 *
 * @module
 */

import * as fs from 'node:fs'
import * as readline from 'node:readline'
import * as v8 from 'node:v8'

import ts from 'typescript'

import { benchOptions, consumerOptions, createHost } from './types-host.ts'

/** One file to check. */
export type Job = {
  id: number
  /** `export` checks a consumer with viem's options, `bench` an attest bench with test/tsconfig.json. */
  mode: 'export' | 'bench'
  file: string
  text: string
  /** Groups jobs that share a baseline. */
  group: string
  baseline: string
}

/** What one check cost. */
export type Cost = { instantiations: number; cpu: number; bytes: number }

/** One result line. `parts` holds the instantiations of each of a consumer's exported forms. */
export type Result = Cost & {
  id: number
  baseline: Cost
  errors: { code: number; message: string }[]
  parts: Record<string, number>
}

/** V8's heap statistics. Recent Node releases add `total_allocated_bytes`, which @types/node lacks. */
type HeapStatistics = v8.HeapInfo & { total_allocated_bytes?: number }

if (allocated() === undefined)
  throw new Error(
    `Node ${process.version} does not report total_allocated_bytes from v8.getHeapStatistics(); Node 26 does`,
  )

const hosts = {
  export: createHost(consumerOptions),
  bench: createHost(benchOptions),
}
const options = { export: consumerOptions, bench: benchOptions }
const templates = new Map<string, ts.Program>()
const baselines = new Map<string, Cost>()

const lines = readline.createInterface({ input: process.stdin })
for await (const line of lines) {
  const job: Job = JSON.parse(line)
  const baseline = baselineOf(job)
  const { cost, errors, parts } = check(job, job.text)
  const result: Result = { id: job.id, ...cost, baseline, errors, parts }
  process.stdout.write(`${JSON.stringify(result)}\n`)
}
// The last line reports the worker's peak resident memory, so types.ts can say what one needs.
process.stdout.write(
  `${JSON.stringify({ peak: process.resourceUsage().maxRSS * 1024 })}\n`,
)

/** Measures a group's baseline the first time a job needs it. */
function baselineOf(job: Job): Cost {
  let baseline = baselines.get(job.group)
  if (baseline) return baseline
  const runs = Array.from({ length: 5 }, () => check(job, job.baseline).cost)
  const counts = new Set(runs.map((run) => run.instantiations))
  if (counts.size > 1)
    throw new Error(`${job.group}: baseline instantiations differ between runs`)
  baseline = {
    instantiations: runs[0]!.instantiations,
    cpu: median(runs.map((run) => run.cpu)),
    bytes: median(runs.map((run) => run.bytes)),
  }
  baselines.set(job.group, baseline)
  return baseline
}

/** Checks one text in a fresh program that reuses the group's parsed files and resolutions. */
function check(job: Job, text: string) {
  const host = hosts[job.mode]
  let template = templates.get(job.group)
  if (!template) {
    host.setFile(job.file, job.baseline)
    template = ts.createProgram({
      rootNames: [job.file],
      options: options[job.mode],
      host,
    })
    templates.set(job.group, template)
  }
  host.setFile(job.file, text)
  const program = ts.createProgram({
    rootNames: [job.file],
    options: options[job.mode],
    host,
    oldProgram: template,
  })
  const file = program.getSourceFile(job.file)!
  const checker = program.getTypeChecker()
  const bytes = allocated()
  const cpu = cpuTime()
  // A consumer's forms resolve one exported alias at a time, in order, so each one's share of the
  // instantiations can explain the cost in a note. The check after them reuses what they resolved.
  const parts: Record<string, number> = {}
  if (job.mode === 'export')
    for (const statement of file.statements) {
      if (!ts.isTypeAliasDeclaration(statement)) continue
      if (
        !statement.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      )
        continue
      const before = program.getInstantiationCount()
      checker.getTypeAtLocation(statement.type)
      parts[statement.name.text] = program.getInstantiationCount() - before
    }
  const diagnostics = program.getSemanticDiagnostics(file)
  // attest also asks for declaration diagnostics, which bench options turn on through `composite`.
  if (job.mode === 'bench') program.getDeclarationDiagnostics(file)
  const cost = {
    cpu: cpuTime() - cpu,
    bytes: allocated() - bytes,
    instantiations: program.getInstantiationCount(),
  }
  const errors = diagnostics
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => ({
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
    }))
  return { cost, errors, parts }
}

/** Bytes V8 has allocated on its heap since the process started. */
function allocated(): number {
  return (v8.getHeapStatistics() as HeapStatistics).total_allocated_bytes!
}

/**
 * The main thread's CPU time in milliseconds. The scheduler's count in schedstat is exact, but only
 * up to date after the kernel recounts the thread, which `process.cpuUsage()` makes it do.
 */
function cpuTime(): number {
  process.cpuUsage()
  return (
    Number(
      fs.readFileSync('/proc/thread-self/schedstat', 'utf8').split(' ')[0],
    ) / 1e6
  )
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]!
}
