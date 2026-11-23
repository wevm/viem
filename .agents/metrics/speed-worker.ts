/**
 * Node process that `speed.ts` starts for each piece of measured work, so measured code runs
 * under Node, as viem's users run it, and every function is measured in a fresh process.
 *
 * - `node speed-worker.ts enumerate <in.json> <out.json>` walks every entry point in
 *   src/package.json, lists each distinct public function (namespace members included), and maps
 *   each recorded key (`src/<file>.ts#<export path>`, or `ox:<file>#<export path>` for an ox
 *   module viem re-exports) to the public function it is.
 * - `node --expose-gc --single-threaded speed-worker.ts bench <job.json> <out.json>` replays one
 *   function with its recorded arguments and measures CPU time and heap bytes per call.
 *
 * A recorded client is rebuilt with a transport that answers from the JSON-RPC exchanges the
 * recorded call got, so an action's time is viem's own work on the client (building requests,
 * formatting, encoding and decoding), and the bench stays offline and repeatable. The network
 * stays blocked as a guard. Before every call, the rebuilt clients start over from the first
 * exchange and, for the cold number, viem's and ox's LRU caches are emptied; both resets also run
 * in the loop whose time is subtracted. A watcher, such as `watchBlockNumber`, is stopped right
 * after each call, and a method that uses `this`, such as `nonceManager.consume`, is called on its
 * object.
 *
 * @module
 */

import * as fs from 'node:fs'
import * as inspector from 'node:inspector/promises'
import { createRequire, syncBuiltinESMExports } from 'node:module'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as v8 from 'node:v8'

import {
  decode,
  decodePlain,
  encode,
  encodePlain,
  keys,
  type Rebuild,
  type RpcExchange,
} from './speed-codec.ts'

const root = path.resolve(import.meta.dirname, '../..')
const [mode, input, output] = process.argv.slice(2)

/** Exports the worker uses to rebuild clients. */
const createClientKey = 'src/clients/createClient.ts#createClient'
const customKey = 'src/clients/transports/custom.ts#custom'
const rpcRequestErrorKey = 'src/errors/request.ts#RpcRequestError'
/** `createClient` parameters; any other recorded client property is added with `extend`. */
const clientParameters = new Set([
  'account',
  'batch',
  'cacheTime',
  'ccipRead',
  'chain',
  'dataSuffix',
  'experimental_blockTag',
  'key',
  'name',
  'pollingInterval',
  'tokens',
  'type',
])

if (mode === 'enumerate') await enumerate()
else if (mode === 'bench') await bench()
else throw new Error(`Unknown mode: ${mode}`)
process.exit(0)

/**
 * The value a recorded key names: `src/<file>.ts#<export path>` in the build in src/_esm, or
 * `ox:<file>#<export path>` in the ox package viem depends on.
 */
async function resolve(key: string): Promise<unknown> {
  const [file, exportPath] = key.split('#') as [string, string]
  const esm = file.startsWith('ox:')
    ? path.join(oxRoot(), file.slice(3))
    : path.join(
        root,
        'src/_esm',
        file.replace(/^src\//, '').replace(/\.ts$/, '.js'),
      )
  let value: unknown = await import(pathToFileURL(esm).href).catch(() => null)
  for (const part of exportPath.split('.'))
    value =
      value && (typeof value === 'object' || typeof value === 'function')
        ? (value as Record<string, unknown>)[part]
        : undefined
  return value
}

/** The root of the ox package viem's source imports. */
function oxRoot() {
  const ox = createRequire(path.join(root, 'src/package.json')).resolve('ox')
  return path.join(path.dirname(fs.realpathSync(ox)), '..')
}

/** The public name of an entry point, such as `viem/actions` for `./actions`. */
function entryName(entry: string) {
  return entry === '.' ? 'viem' : `viem/${entry.slice(2)}`
}

async function enumerate() {
  const { keys } = JSON.parse(fs.readFileSync(input!, 'utf8')) as {
    keys: string[]
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'src/package.json'), 'utf8'),
  )
  type Item = {
    name: string
    entry: string
    keys: string[]
    package?: string | undefined
  }
  const items: Item[] = []
  const byFunction = new Map<unknown, Item>()
  const walked = new Set<unknown>()
  const counts = { functions: 0, errors: 0, classes: 0, values: 0 }
  const entries: { name: string; file: string }[] = []

  const walk = (entry: string, name: string, value: unknown, top: boolean) => {
    if (typeof value === 'function') {
      if (isClass(value)) {
        if (top && !walked.has(value))
          counts[value.prototype instanceof Error ? 'errors' : 'classes']++
        walked.add(value)
        return
      }
      if (byFunction.has(value)) return
      if (top) counts.functions++
      const item = { name: `${entry}:${name}`, entry, keys: [] }
      items.push(item)
      byFunction.set(value, item)
      // Functions carry namespace members, such as `transfer.call` or `writeContract.internal`.
      for (const key of Object.keys(value)) {
        const member = (value as unknown as Record<string, unknown>)[key]
        if (typeof member === 'function')
          walk(entry, `${name}.${key}`, member, false)
      }
      return
    }
    if (isNamespace(value)) {
      if (walked.has(value)) return
      walked.add(value)
      if (top) counts.values++
      for (const [key, member] of Object.entries(value))
        walk(entry, `${name}.${key}`, member, false)
      return
    }
    if (top && !walked.has(value)) counts.values++
    if (value && typeof value === 'object') walked.add(value)
  }

  for (const [entry, target] of Object.entries<{ import?: string }>(
    pkg.exports,
  )) {
    if (!target.import) continue
    const file = path.join(root, 'src', target.import)
    entries.push({ name: entryName(entry), file })
    const module = await import(pathToFileURL(file).href)
    for (const [name, value] of Object.entries(module))
      walk(entryName(entry), name, value, true)
  }

  const unmatched: string[] = []
  for (const key of keys) {
    const item = byFunction.get(await resolve(key))
    if (item) item.keys.push(key)
    else unmatched.push(key)
  }

  // Names the dependency, such as ox, that defines each function no test called through viem.
  const session = new inspector.Session()
  session.connect()
  const scripts = new Map<string, string>()
  session.on('Debugger.scriptParsed', ({ params }) =>
    scripts.set(params.scriptId, params.url),
  )
  await session.post('Debugger.enable')
  const probe = globalThis as { __uphillProbe?: unknown }
  for (const [fn, item] of byFunction) {
    if (item.keys.length) continue
    probe.__uphillProbe = fn
    const { result } = await session.post('Runtime.evaluate', {
      expression: 'globalThis.__uphillProbe',
    })
    const { internalProperties } = await session.post('Runtime.getProperties', {
      objectId: result.objectId!,
    })
    const location = internalProperties?.find(
      (property) => property.name === '[[FunctionLocation]]',
    )?.value?.value as { scriptId: string } | undefined
    const url = location ? scripts.get(location.scriptId) : undefined
    item.package = url?.match(/.*\/node_modules\/((?:@[^/]+\/)?[^/]+)\//)?.[1]
  }
  session.disconnect()

  fs.writeFileSync(
    output!,
    JSON.stringify({ items, counts, entries, unmatched }),
  )
}

type Candidate = { args: string; where: string; direct: boolean }
type Job = {
  name: string
  key: string
  candidates: Candidate[]
  sampleMs: number
  samples: number
}
/** A rebuilt client's transport: what it answered, and a reset to answer the next call afresh. */
type Replayer = {
  reset: () => void
  answered: number
  inexact: number
  misses: Set<string>
}

async function bench() {
  const job = JSON.parse(fs.readFileSync(input!, 'utf8')) as Job
  const write = (result: Record<string, unknown>) =>
    fs.writeFileSync(output!, JSON.stringify({ name: job.name, ...result }))
  process.on('unhandledRejection', () => {})
  const network = blockNetwork()
  const caches = await trackCaches()

  // The function, every export whose calls or paths rebuild values in the arguments, such as
  // `privateKeyToAccount` for an account or `mainnet` for a chain, and what rebuilds clients.
  const exports = new Map<string, unknown>()
  for (const key of new Set([
    job.key,
    createClientKey,
    customKey,
    rpcRequestErrorKey,
    ...job.candidates.flatMap((candidate) => keys(candidate.args)),
  ]))
    exports.set(key, await resolve(key))
  let call = exports.get(job.key) as (...args: unknown[]) => unknown
  if (typeof call !== 'function')
    return write({ ok: false, error: `${job.key} is not a function` })
  // A method that uses `this`, such as `nonceManager.consume`, is called on its object, as the
  // test called it.
  if (
    job.key.slice(job.key.indexOf('#')).includes('.') &&
    /\bthis\b/.test(Function.prototype.toString.call(call))
  )
    call = call.bind(await resolve(job.key.slice(0, job.key.lastIndexOf('.'))))
  const rebuild = (replayers: Replayer[]): Rebuild => ({
    call: (key, args) => {
      const fn = exports.get(key)
      if (typeof fn !== 'function') throw new Error(`${key} is not a function`)
      return fn(...args)
    },
    construct: (key, args) => {
      const Class = exports.get(key)
      if (typeof Class !== 'function') throw new Error(`${key} is not a class`)
      return Reflect.construct(Class, args)
    },
    ref: (key) => exports.get(key),
    client: (config, rpc) => {
      const replayer = replayClient(config, rpc, exports)
      replayers.push(replayer.replayer)
      return replayer.client
    },
  })

  // Every call starts with empty caches and with each rebuilt client answering from the first
  // recorded exchange, as the recorded call did; caches still work within the call.
  let replayers: Replayer[] = []
  const reset = () => {
    for (const replayer of replayers) replayer.reset()
    if (caches.cold) for (const map of caches.maps) map.clear()
  }

  // The first candidate that replays without throwing is the one measured.
  let chosen: Candidate | undefined
  let args: unknown[] = []
  let async = false
  let mutates = false
  let stops = false
  let failure: string | undefined
  for (const candidate of job.candidates) {
    const origins = new Map<object, unknown>()
    let replay: unknown[] = []
    replayers = []
    network.attempts = 0
    async = false
    try {
      replay = await decode(candidate.args, rebuild(replayers), origins)
      reset()
      caches.sets = 0
      const result = call(...replay)
      if (isThenable(result)) {
        async = true
        await withTimeout(result, 5_000)
      }
      // A watcher polls until it is stopped, so each call stops the one it started, as the
      // recorded test did, instead of leaving it to poll during the calls measured after it.
      stops =
        typeof result === 'function' && /(^|[:.#])watch[A-Z]/.test(job.name)
      if (stops) (result as () => void)()
      // A call that recovers from the blocked network, say by retrying, measures the recovery.
      if (network.attempts) throw new Error('the network is disabled')
      const misses = [
        ...new Set(replayers.flatMap((replayer) => [...replayer.misses])),
      ]
      if (misses.length)
        throw new Error(
          `it asked for JSON-RPC responses the recording lacks (${misses.join(', ')})`,
        )
    } catch (error) {
      failure ??= reachedNetwork(error)
        ? `replay needs the network (args from ${candidate.where})`
        : `replay threw: ${message(error)} (args from ${candidate.where})`
      continue
    }
    mutates = (() => {
      try {
        return (
          encode(replay, { known: (value) => origins.get(value) }) !==
          candidate.args
        )
      } catch {
        return true
      }
    })()
    chosen = candidate
    args = mutates ? [] : replay
    break
  }
  if (!chosen) return write({ ok: false, error: failure })
  const cached = caches.sets > 0
  const rpc = {
    answered: replayers.reduce((sum, replayer) => sum + replayer.answered, 0),
    inexact: replayers.reduce((sum, replayer) => sum + replayer.inexact, 0),
  }
  if (mutates) replayers = []

  // Rebuilding the arguments makes fresh clients, which answer from the first exchange already.
  const fresh = (text: string) => decode(text, rebuild([]))
  const loop = makeLoop(
    call,
    args,
    async,
    mutates ? chosen.args : undefined,
    fresh,
    reset,
    stops,
  )
  // Rebuilding the arguments of a function that mutates them costs time and memory, which a
  // second loop that only rebuilds them measures, and which is subtracted.
  const rebuilds = mutates
    ? makeLoop(() => undefined, [], false, chosen.args, fresh, reset)
    : undefined
  // Subtracts only what measuring costs, the reset included. An async function's `await` stays
  // in, as its caller pays it.
  const noop = makeLoop(() => undefined, args, false, undefined, fresh, reset)

  const { count, times } = await measure(loop, job)
  let ns = median(times)
  if (rebuilds) {
    const extra: number[] = []
    for (let i = 0; i < 3; i++)
      extra.push(((await time(rebuilds, count)).cpu * 1000) / count)
    ns = Math.max(0, ns - median(extra))
  } else {
    const extra: number[] = []
    for (let i = 0; i < 3; i++)
      extra.push(((await time(noop, count)).cpu * 1000) / count)
    ns = Math.max(0, ns - median(extra))
  }

  const bytes = Math.max(
    0,
    (await allocated(loop, count)) - (await allocated(rebuilds ?? noop, count)),
  )
  // The value is the cold-cache time; the note also gives the time once the caches hold the
  // input, as repeated calls with one input see.
  let warm: number | undefined
  if (cached) {
    caches.cold = false
    warm = median((await measure(loop, job)).times)
    warm = Math.max(0, warm - (median(times) - ns))
  }
  write({
    ok: true,
    ns,
    warm,
    times,
    bytes,
    count,
    async,
    mutates,
    stops,
    noops: chosen.args.includes('"$noop":1'),
    cached,
    rpc,
    where: chosen.where,
    direct: chosen.direct,
  })
}

/**
 * A client with the recorded configuration whose transport answers each JSON-RPC request with the
 * response the recorded call got to the same request (method and params), in order when it made
 * the same request more than once. A request the recording has no match for, such as one that
 * carries a fresh signature or timestamp, gets the next response recorded for its method. A
 * request whose method the recording lacks fails, and so does the replay.
 */
function replayClient(
  config: Record<string, unknown>,
  rpc: RpcExchange[],
  exports: Map<string, unknown>,
) {
  const createClient = exports.get(createClientKey) as (
    parameters: Record<string, unknown>,
  ) => { extend: (fn: () => unknown) => unknown }
  const custom = exports.get(customKey) as (
    provider: unknown,
    config: unknown,
  ) => (options: unknown) => { config: unknown; request: unknown }
  const RpcRequestError = exports.get(rpcRequestErrorKey) as new (
    options: unknown,
  ) => Error
  type Entry = { ok: 0 | 1; text: string; value: unknown; plain: boolean }
  const exact = new Map<string, Entry[]>()
  const byMethod = new Map<string, Entry[]>()
  for (const [method, params, ok, value] of rpc) {
    const text = JSON.stringify(value)
    const entry = { ok, text, value, plain: !text.includes('{"$') }
    const key = `${method}\0${JSON.stringify(params)}`
    if (!exact.has(key)) exact.set(key, [])
    exact.get(key)!.push(entry)
    if (!byMethod.has(method)) byMethod.set(method, [])
    byMethod.get(method)!.push(entry)
  }
  // Exact matches take a key's exchanges in order. A request without one takes its method's first
  // exchange no request has taken yet, so it does not get the answer meant for another request.
  const cursors = new Map<Entry[], number>()
  const used = new Set<Entry>()
  const take = (entries: Entry[]) => {
    const index = cursors.get(entries) ?? 0
    cursors.set(entries, index + 1)
    const entry = entries[Math.min(index, entries.length - 1)]!
    used.add(entry)
    return entry
  }
  const takeUnused = (entries: Entry[]) => {
    const entry =
      entries.find((entry) => !used.has(entry)) ?? entries[entries.length - 1]!
    used.add(entry)
    return entry
  }
  const { transport: recorded = {}, ...rest } = config as {
    transport?: Record<string, unknown>
  }
  const url = typeof recorded.url === 'string' ? recorded.url : 'replay://'
  const replayer: Replayer = {
    reset: () => {
      cursors.clear()
      used.clear()
    },
    answered: 0,
    inexact: 0,
    misses: new Set(),
  }
  const provider = {
    async request({ method, params }: { method: string; params?: unknown }) {
      const key = `${method}\0${encodePlain(params)}`
      const matches = exact.get(key)
      const similar = matches ? undefined : byMethod.get(method)
      if (!matches && !similar) {
        replayer.misses.add(method)
        throw new RpcRequestError({
          body: { method, params },
          error: { code: -32601, message: 'the recording has no response' },
          url,
        })
      }
      replayer.answered++
      if (similar) replayer.inexact++
      const entry = matches ? take(matches) : takeUnused(similar!)
      const value = entry.plain
        ? JSON.parse(entry.text)
        : decodePlain(entry.value)
      if (entry.ok) return value
      throw new RpcRequestError({ body: { method, params }, error: value, url })
    },
  }
  const parameters: Record<string, unknown> = {}
  const extras: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest))
    (clientParameters.has(key) ? parameters : extras)[key] = value
  const client = createClient({
    ...parameters,
    transport: (options: unknown) => {
      const { config, request } = custom(provider, { retryCount: 0 })(options)
      return { config, request, value: recorded }
    },
  })
  return {
    client: Object.keys(extras).length ? client.extend(() => extras) : client,
    replayer,
  }
}

type Loop = (count: number) => unknown

/**
 * Grows the iteration count until one run of the loop takes about `sampleMs` of CPU time, and
 * keeps running it until three runs in a row agree within 15%, so V8 has compiled the function
 * and its callees before the `samples` timings (ns per call) are taken. With `--single-threaded`
 * V8 compiles on this thread, so early runs can take several times longer than later ones. A call
 * that waits, such as on a polling interval, takes wall time without CPU time, so a run is kept
 * under half a second of wall time.
 */
async function measure(loop: Loop, job: Job) {
  const target = job.sampleMs * 1000
  let count = 1
  let spent = 0
  let waited = 0
  const perCall: number[] = []
  for (;;) {
    const { cpu, wall } = await time(loop, count)
    spent += cpu
    waited += wall
    const most = Math.max(1, Math.floor((count * 500) / Math.max(wall, 1)))
    if (waited >= 5000) {
      count = Math.min(count, most)
      break
    }
    if (cpu < target / 2 && count < most) {
      count = Math.min(
        most,
        cpu < target / 20
          ? count * 10
          : Math.max(count + 1, Math.ceil((count * target) / Math.max(cpu, 1))),
      )
      continue
    }
    perCall.push(cpu / count)
    const last = perCall.slice(-3)
    if (last.length === 3 && Math.max(...last) / Math.min(...last) < 1.15) break
    if (spent >= 1_500_000) break
    count = Math.min(most, Math.max(1, Math.round(target / median(last))))
  }
  const times: number[] = []
  for (let i = 0; i < job.samples; i++)
    times.push(((await time(loop, count)).cpu * 1000) / count)
  return { count, times }
}

/**
 * A fresh loop per function keeps its call site monomorphic. With `text`, every call rebuilds its
 * arguments from it, for functions that mutate their arguments. `reset` runs before every call.
 * With `stops`, every call's result, a watcher's unwatch function, is called right after it.
 */
function makeLoop(
  fn: (...args: unknown[]) => unknown,
  args: unknown[],
  async: boolean,
  text: string | undefined,
  decode: (text: string) => Promise<unknown[]>,
  reset: () => void,
  stops = false,
): Loop {
  const params = args.map((_, i) => `a${i}`)
  // Rebuilding arguments is async, as rebuilding a value an async export returned awaits it.
  const call = text ? `fn(...(await decode(text)))` : `fn(${params.join(', ')})`
  return new Function(
    'fn',
    'args',
    'decode',
    'text',
    'reset',
    `const [${params.join(', ')}] = args
return ${async || text ? 'async ' : ''}function loop(count) {
  let result
  for (let i = 0; i < count; i++) {
    reset()
    result = ${async ? 'await ' : ''}${call}${stops ? '\n    result()' : ''}
  }
  return result
}`,
  )(fn, args, decode, text, reset)
}

/** CPU time of the whole process in µs, which `--single-threaded` keeps on this thread. */
async function time(loop: Loop, count: number) {
  const wall = performance.now()
  const start = process.cpuUsage()
  const result = loop(count)
  if (isThenable(result)) await result
  const { user, system } = process.cpuUsage(start)
  return { cpu: user + system, wall: performance.now() - wall }
}

/**
 * Heap bytes allocated per call: the growth of the used heap over the loop plus everything each
 * garbage collection during the loop freed, which `v8.GCProfiler` reports. Median of 3.
 */
async function allocated(loop: Loop, count: number) {
  const samples: number[] = []
  for (let i = 0; i < 3; i++) {
    globalThis.gc!()
    globalThis.gc!()
    const profiler = new v8.GCProfiler()
    profiler.start()
    const before = v8.getHeapStatistics().used_heap_size
    const result = loop(count)
    if (isThenable(result)) await result
    const after = v8.getHeapStatistics().used_heap_size
    let freed = 0
    for (const event of profiler.stop()?.statistics ?? [])
      freed +=
        event.beforeGC.heapStatistics.usedHeapSize -
        event.afterGC.heapStatistics.usedHeapSize
    samples.push((after - before + freed) / count)
  }
  return median(samples)
}

/**
 * Tracks viem's and ox's LRU caches, such as `getAddress`'s checksum cache and the block number
 * cache, as they are first written, so a cold call can start with all of them empty while they
 * still work within the call: a call that checksums one address twice computes it once, as a
 * first call with that input does. `sets` counts writes, which mark a function as cached.
 */
async function trackCaches() {
  const caches = { sets: 0, cold: true, maps: new Set<Map<unknown, unknown>>() }
  const files = [path.join(root, 'src/_esm/utils/lru.js')]
  try {
    const ox = createRequire(path.join(root, 'src/package.json')).resolve('ox')
    files.push(path.join(path.dirname(ox), '..', '_esm/core/internal/lru.js'))
  } catch {}
  for (const file of files) {
    if (!fs.existsSync(file)) continue
    const { LruMap } = await import(pathToFileURL(fs.realpathSync(file)).href)
    const set = LruMap.prototype.set
    LruMap.prototype.set = function (key: unknown, value: unknown) {
      caches.sets++
      caches.maps.add(this)
      return set.call(this, key, value)
    }
  }
  return caches
}

/** A replayed call that reaches for the network throws instead. */
function blockNetwork() {
  const network = { attempts: 0 }
  const blocked = () => {
    network.attempts++
    throw new Error('the network is disabled in the speed bench')
  }
  globalThis.fetch = (async () => blocked()) as unknown as typeof fetch
  ;(globalThis as { WebSocket?: unknown }).WebSocket = class {
    constructor() {
      blocked()
    }
  }
  const net = createRequire(import.meta.url)('node:net')
  net.connect = net.createConnection = blocked
  syncBuiltinESMExports()
  return network
}

function withTimeout(promise: PromiseLike<unknown>, ms: number) {
  let timer: NodeJS.Timeout | undefined
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`did not settle within ${ms / 1000}s`)),
        ms,
      )
    }),
  ]).finally(() => clearTimeout(timer))
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  )
}

function isClass(value: unknown) {
  return /^class[\s{]/.test(Function.prototype.toString.call(value))
}

/** A module namespace, or a plain object whose values are all functions or namespaces. */
function isNamespace(value: unknown, depth = 0): value is object {
  if (!value || typeof value !== 'object' || depth > 3) return false
  if (Object.prototype.toString.call(value) === '[object Module]') return true
  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) return false
  const values = Object.values(value)
  return (
    values.length > 0 &&
    values.every(
      (item) => typeof item === 'function' || isNamespace(item, depth + 1),
    )
  )
}

/** Whether an error, or an error it wraps, is `blockNetwork`'s. */
function reachedNetwork(error: unknown): boolean {
  for (let cause = error, depth = 0; cause && depth < 10; depth++) {
    if (/network is disabled/.test(String((cause as Error).message)))
      return true
    cause = (cause as Error).cause
  }
  return false
}

function message(error: unknown) {
  const text = String(
    (error as { shortMessage?: string })?.shortMessage ??
      (error as Error)?.message ??
      error,
  )
  return text.split('\n')[0]!.slice(0, 160)
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = sorted.length >> 1
  return sorted.length % 2
    ? sorted[middle]!
    : (sorted[middle - 1]! + sorted[middle]!) / 2
}
