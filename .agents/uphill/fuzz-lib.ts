/**
 * Shared pieces of the fuzz category: a seeded PRNG, the crash oracle's error classification, the
 * corpus decoder, the boundary mutator that turns a recorded argument set into new ones, the
 * minimizer, and the formatter that prints an input in a metric note.
 *
 * Every mutation says whether it keeps the argument's TypeScript type. A hex string stays a
 * `0x${string}` (empty, odd-length, uppercase, or not hex at all), a bigint stays a bigint (zero,
 * 2^n ± 1, negative, huge), an object gains a field or loses one that another recorded call left
 * out. Those inputs are ones a typed caller can pass, so a `TypeError`, `RangeError`, or
 * `SyntaxError` they cause is a bug. A wrong type, a missing required field, or a mangled literal
 * (`'latest'` → `'lat'`) breaks the type, so only a hang, runaway memory, or a stack overflow they
 * cause is one.
 *
 * @module
 */

/** A seeded PRNG (mulberry32), so a function's inputs are the same on every run. */
export function prng(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (n: number) => Math.floor(next() * n),
    pick: <value>(values: readonly value[]): value =>
      values[Math.floor(next() * values.length)]!,
  }
}
export type Prng = ReturnType<typeof prng>

/** A 32-bit FNV-1a hash of a string, for per-function seeds. */
export function hash32(text: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// ---------------------------------------------------------------------------------------------
// The crash oracle.

/** Built-in errors that mean the code, not the input, went wrong. */
const programmerErrors = new Set<unknown>([
  TypeError,
  RangeError,
  SyntaxError,
  ReferenceError,
  EvalError,
  URIError,
])

export type Crash = { kind: string; message: string; site?: string | undefined }

/**
 * Whether a thrown value is a bug: anything not an `Error`, a stack overflow on a small input, or,
 * for an input that keeps the types, a built-in programmer error. viem's `BaseError`s, ox's and
 * abitype's errors, and plain `Error`s (the generic `ErrorType` viem's error unions list) are
 * documented.
 */
export function classify(
  error: unknown,
  typed: boolean,
  args: unknown[],
): Crash | undefined {
  if (!(error instanceof Error))
    return { kind: 'threw a non-Error', message: short(String(error)) }
  const message = short(error.message)
  if (error instanceof RangeError && /Maximum call stack/.test(error.message))
    return sizeOf(args) < 10_000
      ? { kind: 'stack overflow', message, site: site(error) }
      : undefined
  const ctor = Object.getPrototypeOf(error)?.constructor
  if (!typed || !programmerErrors.has(ctor)) return undefined
  // `BigInt('0xzz')`'s SyntaxError names the string, which is `0x${string}` but not hex.
  if (
    error instanceof SyntaxError &&
    /Cannot convert .* to a BigInt/.test(error.message) &&
    numbersIn(args).invalidHex
  )
    return undefined
  // Empty hex as a number (`hexToBigInt('0x')`) throws this SyntaxError on purpose: viem's own
  // test snapshots it (src/utils/encoding/fromHex.test.ts, "0x" row), and ox does the same.
  if (
    error instanceof SyntaxError &&
    /^Cannot convert 0x to a BigInt$/.test(error.message)
  )
    return undefined
  // A RangeError that names the bad number is the right error for it: a fraction or a non-finite
  // number where viem needs an integer, a size so large that allocating it fails, or a negative
  // length.
  if (error instanceof RangeError) {
    const { fraction, huge, negative } = numbersIn(args)
    if (
      fraction &&
      /not an integer|Invalid (count|time) value|toString\(\) radix/.test(
        error.message,
      )
    )
      return undefined
    if (
      huge &&
      /Invalid (string|typed array|array) length|allocation failed|Invalid count value|Array buffer|out of memory|Invalid DataView|Maximum BigInt size/i.test(
        error.message,
      )
    )
      return undefined
    if (
      negative &&
      /Invalid (typed array|array) length: -\d/.test(error.message)
    )
      return undefined
  }
  return { kind: ctor.name, message, site: site(error) }
}

/** Whether an input holds a non-integer number, or a number of 2^24 or more (or not finite). */
function numbersIn(args: unknown[]) {
  const facts = {
    fraction: false,
    huge: false,
    invalidHex: false,
    negative: false,
  }
  const visit = (value: unknown, depth: number) => {
    if (depth > 10) return
    if (typeof value === 'string') {
      if (/^0x/i.test(value) && !/^0x[0-9a-fA-F]*$/.test(value))
        facts.invalidHex = true
    } else if (typeof value === 'number') {
      if (!Number.isInteger(value)) facts.fraction = true
      if (value < 0) facts.negative = true
      if (!Number.isFinite(value) || Math.abs(value) >= 2 ** 24)
        facts.huge = true
    } else if (typeof value === 'bigint') {
      if (value >= 2n ** 24n || value <= -(2n ** 24n)) facts.huge = true
    } else if (
      value &&
      typeof value === 'object' &&
      !(value instanceof Uint8Array) &&
      !named.has(value)
    )
      for (const key of Object.keys(value))
        visit((value as Record<string, unknown>)[key], depth + 1)
  }
  visit(args, 0)
  return facts
}

/** The first stack frame in viem's build or a dependency, as `file:line`. */
export function site(error: unknown): string | undefined {
  const stack = String((error as Error)?.stack ?? '')
  for (const line of stack.split('\n').slice(1)) {
    const match = line.match(/\(?(?:file:\/\/)?([^\s()]+):(\d+):\d+\)?$/)
    if (!match) continue
    const file = match[1]!
    if (/fuzz-|node:|fast-check/.test(file)) continue
    const relative = file
      .replace(/^.*\/src\/_esm\//, 'src/_esm/')
      .replace(/^.*\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?/, '')
    return `${relative}:${match[2]}`
  }
  return undefined
}

export function short(text: string, length = 160) {
  const line = text.split('\n')[0]!.replace(/\s+/g, ' ')
  return line.length > length ? `${line.slice(0, length - 1)}…` : line
}

// ---------------------------------------------------------------------------------------------
// Formatting inputs for notes.

/** Values the formatter prints by name, such as a chain or an ABI from viem's exports. */
export const named = new WeakMap<object, string>()

/** A compact, JavaScript-like rendering of a value, cut at about `budget` characters. */
export function format(value: unknown, budget = 400): string {
  const out: string[] = []
  let left = budget
  const push = (text: string) => {
    out.push(text)
    left -= text.length
  }
  const visit = (value: unknown, depth: number, seen: Set<object>) => {
    if (left <= 0) return push('…')
    switch (typeof value) {
      case 'bigint':
        return push(`${value}n`)
      case 'number':
        return push(Object.is(value, -0) ? '-0' : String(value))
      case 'string': {
        const text = JSON.stringify(value)
        return push(
          text.length > 120
            ? `${text.slice(0, 60)}…(${value.length} chars)…${text.slice(-30)}`
            : text,
        )
      }
      case 'undefined':
        return push('undefined')
      case 'boolean':
        return push(String(value))
      case 'symbol':
        return push(String(value))
      case 'function':
        return push(
          named.get(value) ?? `[function ${value.name || 'anonymous'}]`,
        )
    }
    if (value === null) return push('null')
    const object = value as object
    const name = named.get(object)
    if (name) return push(name)
    if (seen.has(object)) return push('[cycle]')
    if (object instanceof Uint8Array) {
      const hex = toHex(object)
      return push(
        `Uint8Array(0x${hex.length > 80 ? `${hex.slice(0, 40)}…(${object.length} bytes)` : hex})`,
      )
    }
    if (depth > 6) return push('…')
    seen.add(object)
    if (Array.isArray(object)) {
      push('[')
      object.forEach((item, i) => {
        if (i) push(', ')
        if (i > 12 && object.length > 16) {
          push(`…${object.length - i} more`)
          return
        }
        visit(item, depth + 1, seen)
      })
      push(']')
    } else {
      push('{')
      Object.keys(object).forEach((key, i) => {
        if (i) push(', ')
        push(
          /^[A-Za-z_$][\w$]*$/.test(key)
            ? `${key}: `
            : `${JSON.stringify(key)}: `,
        )
        visit((object as Record<string, unknown>)[key], depth + 1, seen)
      })
      push('}')
    }
    seen.delete(object)
  }
  visit(value, 0, new Set())
  return out.join('')
}

/** The length of a value's rendering without a budget, to judge whether an input is small. */
export function sizeOf(value: unknown): number {
  let total = 0
  const visit = (value: unknown, depth: number) => {
    if (total > 1e6 || depth > 200) return
    if (typeof value === 'string') total += value.length
    else if (value instanceof Uint8Array) total += value.length * 2
    else if (value && typeof value === 'object' && !named.has(value)) {
      for (const key of Object.keys(value)) {
        total += key.length + 1
        visit((value as Record<string, unknown>)[key], depth + 1)
      }
    } else total += 4
  }
  visit(value, 0)
  return total
}

export function toHex(bytes: Uint8Array): string {
  let out = ''
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0')
  return out
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++)
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

// ---------------------------------------------------------------------------------------------
// The corpus: argument sets viem's tests passed, in speed-codec's JSON format.

export type Rebuild = {
  ref: (key: string) => unknown
  call: (key: string, args: unknown[]) => unknown
}

/** Values rebuilt from an export or a call, which the mutator leaves alone. */
export const opaque = new WeakSet<object>()

/**
 * Rebuilds an argument set the speed recording wrote (see speed-codec.ts). Values that come from
 * viem's exports or calls, such as chains, ABIs, and accounts, are marked opaque and named.
 */
export function decodeSeed(text: string, rebuild: Rebuild): unknown[] {
  const mark = (value: unknown, name: string) => {
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      opaque.add(value)
      if (!named.has(value)) named.set(value, name)
    }
    return value
  }
  const decodeValue = (value: unknown): unknown => {
    if (value === null || typeof value !== 'object') return value
    if (Array.isArray(value)) {
      const out: unknown[] = []
      for (let i = 0; i < value.length; i++) {
        const item = value[i] as { hole?: number } | null
        if (item && typeof item === 'object' && item.hole === 1)
          out.length = i + 1
        else out[i] = decodeValue(item)
      }
      return out
    }
    const record = value as Record<string, unknown>
    if ('$u' in record) return undefined
    if ('$b' in record) return BigInt(record.$b as string)
    if ('$n' in record) return Number(record.$n)
    if ('$u8' in record) return fromHex(record.$u8 as string)
    if ('$d' in record) return new Date(record.$d as number)
    if ('$ref' in record) {
      const key = record.$ref as string
      return mark(rebuild.ref(key), key.split('#')[1]!)
    }
    if ('$call' in record) {
      const key = record.$call as string
      const args = (record.$args as unknown[]).map(decodeValue)
      return mark(rebuild.call(key, args), `${key.split('#')[1]}(…)`)
    }
    if ('$client' in record) throw new Error('passes a client')
    if ('$fn' in record)
      return mark(Function(`return (${record.$fn as string})`)(), '[function]')
    const source = ('$o' in record ? record.$o : record) as Record<
      string,
      unknown
    >
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(source)) out[key] = decodeValue(source[key])
    return out
  }
  return (JSON.parse(text) as unknown[]).map(decodeValue)
}

// ---------------------------------------------------------------------------------------------
// The boundary mutator.

/** One mutated input: the arguments, whether they keep their types, and what changed. */
export type Mutant = { args: unknown[]; typed: boolean; changes: string[] }

type Slot = {
  path: (string | number)[]
  value: unknown
  get: () => unknown
  set: (value: unknown) => void
  remove?: (() => void) | undefined
}

const bigintEdges = (() => {
  const out: bigint[] = [0n, 1n, -1n, 2n ** 1024n, -(2n ** 1024n)]
  for (const n of [
    7, 8, 15, 16, 31, 32, 53, 63, 64, 127, 128, 159, 160, 255, 256, 257,
  ])
    out.push(
      2n ** BigInt(n) - 1n,
      2n ** BigInt(n),
      2n ** BigInt(n) + 1n,
      -(2n ** BigInt(n)),
    )
  return out
})()
const numberEdges = [
  0,
  -0,
  1,
  -1,
  2,
  0.5,
  -0.5,
  127,
  128,
  255,
  256,
  2 ** 15,
  2 ** 16 - 1,
  2 ** 16,
  2 ** 31 - 1,
  2 ** 31,
  2 ** 32 - 1,
  2 ** 32,
  2 ** 53 - 1,
  2 ** 53,
  2 ** 53 + 2,
  1e21,
  -(2 ** 31),
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  Number.MIN_VALUE,
]
const stringEdges = [
  '',
  ' ',
  'a',
  '\u0000',
  '\n',
  '\r\n',
  'é',
  'e\u0301',
  '𝔘𝔫𝔦𝔠𝔬𝔡𝔢',
  '😀',
  '\uD800',
  '\uDFFF',
  'a\uD83Dz',
  '\u202Eabc',
  '\uFEFF',
  'İ',
  'ß',
  'x'.repeat(10_000),
  '0x',
  '-1',
  'NaN',
  '1e999',
  '{}',
  '%s%n',
  '..',
  'a.b',
  'A',
  '\t\u00A0\u2028',
]

/** Hex string variants: each stays `0x${string}`. */
function hexVariants(hex: string, random: Prng): string[] {
  const body = hex.slice(2)
  const filler = random.pick(['00', 'ff', '7f', '80', '01'])
  return [
    '0x',
    '0x0',
    '0x00',
    '0x1',
    `0x${body.slice(0, -1)}`,
    `0x${body}0`,
    `0x${body.toUpperCase()}`,
    `0x${body.slice(0, body.length >> 1)}`,
    `0x${body}${body}`,
    `0x${filler.repeat(32)}`,
    `0x${filler.repeat(20)}`,
    `0x${filler.repeat(65)}`,
    `0x${'00'.repeat(4)}${body}`,
    `0x${body}${filler}`,
    `0x${body.slice(2)}`,
    `0xzz${body.slice(2)}`,
    `0x${body.slice(0, -2)}g0`,
    `0x ${body}`,
    `0x${'ff'.repeat(4_096)}`,
    `0x${body
      .split('')
      .map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase()))
      .join('')}`,
  ]
}

/** Whether a string is free text, so any other string keeps its type, not a literal like `'latest'`. */
function freeText(text: string, key: string | number | undefined) {
  // ABI type strings (`uint256[]`, `tuple(address,bool)`) and fields such as `type` and
  // `stateMutability` are literal unions, not free text.
  if (
    typeof key === 'string' &&
    /^(type|internalType|stateMutability|primaryType|kind|blockTag|to|dir|unit|mode|version)$/.test(
      key,
    )
  )
    return false
  return text.length > 24 || /[^\w\-[\](),]/.test(text)
}

/** Whether an array's elements share one shape, so it is a list rather than a tuple. */
export function homogeneous(values: unknown[]) {
  const shape = (value: unknown) =>
    value && typeof value === 'object' && !(value instanceof Uint8Array)
      ? `${Array.isArray(value) ? 'array' : 'object'}:${Array.isArray(value) ? '' : Object.keys(value).sort().join(',')}`
      : typeof value === 'string' && /^0x/.test(value)
        ? `hex:${value.length}`
        : // Literal strings, such as ABI types, make a tuple: `['uint256', 'bool']`.
          typeof value === 'string' && !freeText(value, undefined)
          ? `literal:${value}`
          : typeof value
  return values.every((value) => shape(value) === shape(values[0]))
}

/**
 * Lists the mutable slots of an argument set: every value reachable through plain arrays and
 * objects, minus opaque ones (chains, ABIs, and accounts from viem's exports).
 */
function slots(args: unknown[]): Slot[] {
  const out: Slot[] = []
  const visit = (
    value: unknown,
    path: (string | number)[],
    get: () => unknown,
    set: (value: unknown) => void,
    remove: (() => void) | undefined,
    depth: number,
  ) => {
    if (isSchema(path.at(-1), value)) return
    const slot: Slot = { path, value, get, set, remove }
    out.push(slot)
    if (depth > 8 || !value || typeof value !== 'object') return
    if (
      opaque.has(value) ||
      value instanceof Uint8Array ||
      value instanceof Date
    )
      return
    if (Array.isArray(value)) {
      value.forEach((_, i) => {
        visit(
          value[i],
          [...path, i],
          () => value[i],
          (next) => {
            value[i] = next
          },
          () => {
            value.splice(i, 1)
          },
          depth + 1,
        )
      })
      return
    }
    const proto = Object.getPrototypeOf(value)
    if (proto !== Object.prototype && proto !== null) return
    const record = value as Record<string, unknown>
    for (const key of Object.keys(record))
      visit(
        record[key],
        [...path, key],
        () => record[key],
        (next) => {
          record[key] = next
        },
        () => {
          delete record[key]
        },
        depth + 1,
      )
  }
  args.forEach((arg, i) => {
    visit(
      arg,
      [i],
      () => args[i],
      (next) => {
        args[i] = next
      },
      undefined,
      0,
    )
  })
  return out
}

/** A path with array indices folded, so the objects of one parameter share optional fields. */
export function shapeKey(path: (string | number)[]) {
  return path.map((part) => (typeof part === 'number' ? '#' : part)).join('.')
}

/** The field sets recorded objects carried at each position, such as `0.authorization`. */
export type Shapes = Map<string, Set<string>>

/** Fields whose string value picks a variant of a union type, such as a transaction's `type`. */
const discriminators = new Set([
  'type',
  'domain',
  'primaryType',
  'kind',
  'mode',
])

/** An object's fields, sorted, with each discriminator's value: `chainId,nonce,type=eip1559`. */
function fieldsOf(value: Record<string, unknown>) {
  return Object.keys(value)
    .filter((field) => value[field] !== undefined)
    .map((field) =>
      discriminators.has(field) && typeof value[field] === 'string'
        ? `${field}=${value[field]}`
        : field,
    )
    .sort()
    .join(',')
}

/**
 * The fields each recorded object carried, by position. An object left with exactly the fields of
 * a recorded object there (and the same variant) keeps the type: that covers optional fields and
 * `OneOf` variants (`address` or `contractAddress`) without knowing the type. A looser rule (any
 * superset of a recorded object's fields) mixes up the variants of a union, such as a deposit
 * transaction's fields with an EIP-1559 one's.
 */
export function shapesOf(seeds: unknown[][]): Shapes {
  const out: Shapes = new Map()
  const visit = (value: unknown, path: (string | number)[], depth: number) => {
    if (depth > 8 || !value || typeof value !== 'object' || opaque.has(value))
      return
    if (value instanceof Uint8Array || value instanceof Date) return
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        visit(item, [...path, i], depth + 1)
      })
      return
    }
    const key = shapeKey(path)
    if (!out.has(key)) out.set(key, new Set())
    out.get(key)!.add(fieldsOf(value as Record<string, unknown>))
    for (const [field, item] of Object.entries(value))
      visit(item, [...path, field], depth + 1)
  }
  for (const seed of seeds)
    seed.forEach((arg, i) => {
      visit(arg, [i], 0)
    })
  return out
}

/**
 * Whether an object at `path` carries exactly the fields of some recorded object there. EIP-712
 * data (`message`, `domain`, or `data` beside `types`) must carry every field its own `types`
 * declare, which other recorded calls say nothing about, and its `message` is required.
 */
export function keepsType(
  shapes: Shapes,
  path: (string | number)[],
  record: Record<string, unknown>,
  args: unknown[],
) {
  const root = args[path[0] as number] as { types?: unknown } | undefined
  if (
    root?.types &&
    typeof root.types === 'object' &&
    (path.length === 1 ||
      path.some(
        (part) => part === 'message' || part === 'domain' || part === 'data',
      ))
  )
    return false
  return shapes.get(shapeKey(path))?.has(fieldsOf(record)) ?? false
}

const solidityType =
  /^(u?int\d*|bytes\d*|bool|address|string|function|tuple(\(.*\))?)(\[\d*\])*$/

/**
 * Whether a value describes a schema rather than data: an ABI, its parameters, or EIP-712 types.
 * Mutating a schema mostly breaks the type of everything that depends on it, so it is left alone.
 */
export function isSchema(key: string | number | undefined, value: unknown) {
  if (
    typeof key === 'string' &&
    /^(abi|types|components|inputs|outputs)$/.test(key)
  )
    return true
  if (Array.isArray(value))
    return (
      value.length > 0 &&
      value.every(
        (item) =>
          (typeof item === 'string' && solidityType.test(item)) ||
          (item &&
            typeof item === 'object' &&
            typeof (item as { type?: unknown }).type === 'string' &&
            (solidityType.test((item as { type: string }).type) ||
              /^(function|event|error|constructor|fallback|receive)$/.test(
                (item as { type: string }).type,
              ))),
      )
    )
  return false
}

/** Marks the class instances and functions inside hand-written arguments as opaque. */
export function markOpaque(value: unknown, depth = 0) {
  if (!value || depth > 20) return
  if (typeof value === 'function') {
    opaque.add(value)
    return
  }
  if (typeof value !== 'object' || value instanceof Uint8Array) return
  const proto = Object.getPrototypeOf(value)
  if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) {
    opaque.add(value)
    return
  }
  for (const key of Object.keys(value))
    markOpaque((value as Record<string, unknown>)[key], depth + 1)
}

/** A deep copy that keeps opaque values (chains, ABIs, accounts) by reference. */
export function clone<value>(value: value, depth = 0): value {
  if (!value || typeof value !== 'object' || opaque.has(value) || depth > 50)
    return value
  if (value instanceof Uint8Array) return new Uint8Array(value) as value
  if (value instanceof Date) return new Date(value.getTime()) as value
  if (Array.isArray(value)) {
    const out: unknown[] = []
    for (let i = 0; i < value.length; i++)
      if (i in value) out[i] = clone(value[i], depth + 1)
      else out.length = i + 1
    return out as value
  }
  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) return value
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(value))
    out[key] = clone((value as never)[key], depth + 1)
  return out as value
}

const wrongTypes: unknown[] = [
  undefined,
  null,
  0,
  1n,
  '',
  'x',
  true,
  [],
  {},
  new Uint8Array(),
]

/** Applies one boundary mutation to a copy of `seed`. */
export function mutate(
  seed: unknown[],
  random: Prng,
  shapes: Shapes,
  count = 1,
  params: string[] = [],
): Mutant {
  const args = clone(seed)
  let typed = true
  const changes: string[] = []
  for (let round = 0; round < count; round++) {
    const all = slots(args)
    if (!all.length) break
    const slot = random.pick(all)
    const label = `arg${slot.path[0]}${slot.path
      .slice(1)
      .map((part) => (typeof part === 'number' ? `[${part}]` : `.${part}`))
      .join('')}`
    const value = slot.get()
    const roll = random.next()
    // A wrong type breaks the declared type, so only hangs and stack overflows count.
    if (roll < 0.07) {
      const next = random.pick(
        wrongTypes.filter((item) => typeof item !== typeof value),
      )
      slot.set(clone(next))
      typed = false
      changes.push(`${label} = ${format(next, 40)} (wrong type)`)
      continue
    }
    if (typeof value === 'bigint') {
      const next =
        roll < 0.6
          ? random.pick(bigintEdges)
          : random.pick([
              value + 1n,
              value - 1n,
              -value,
              value * 2n ** 64n,
              value ^ 1n,
            ])
      slot.set(next)
      changes.push(`${label} = ${next}n`)
    } else if (typeof value === 'number') {
      let next =
        roll < 0.6
          ? random.pick(numberEdges)
          : random.pick([
              value + 1,
              value - 1,
              -value,
              value * 2 ** 32,
              value + 0.5,
            ])
      // A size or length is an allocation: 2^31 bytes is gigabytes of memory or a byte-by-byte
      // loop that runs for minutes, which is what was asked for, not a bug. Cap it at 2^20.
      const key =
        slot.path.length > 1 ? slot.path.at(-1) : params[slot.path[0] as number]
      if (
        typeof key === 'string' &&
        /size|length/i.test(key) &&
        Number.isFinite(next) &&
        Math.abs(next) > 2 ** 20
      )
        next = Math.sign(next) * 2 ** 20
      slot.set(next)
      changes.push(`${label} = ${format(next)}`)
    } else if (typeof value === 'boolean') {
      slot.set(!value)
      changes.push(`${label} = ${!value}`)
    } else if (typeof value === 'string') {
      if (/^0x/.test(value)) {
        const next = random.pick(hexVariants(value, random))
        slot.set(next)
        changes.push(`${label} = ${format(next, 60)}`)
      } else {
        const next =
          roll < 0.5
            ? random.pick(stringEdges)
            : random.pick([
                value + random.pick(stringEdges),
                random.pick(stringEdges) + value,
                value.slice(0, value.length >> 1),
                value.toUpperCase(),
                value.repeat(3),
                ` ${value} `,
                value.replace(/\n/g, '\n\n'),
                value.normalize('NFD'),
              ])
        slot.set(next)
        if (!freeText(value, slot.path.at(-1)) || next === '') typed = false
        changes.push(
          `${label} = ${format(next, 60)}${typed ? '' : ' (not a listed literal)'}`,
        )
      }
    } else if (value instanceof Uint8Array) {
      const variants = [
        new Uint8Array(),
        new Uint8Array([0]),
        new Uint8Array([0x80]),
        value.slice(0, value.length >> 1),
        value.slice(1),
        new Uint8Array([...value, 0]),
        new Uint8Array([0, ...value]),
        new Uint8Array(32).fill(0xff),
        new Uint8Array(65),
        new Uint8Array(value.length).fill(0xff),
      ]
      const next = random.pick(variants)
      slot.set(next)
      changes.push(`${label} = ${format(next, 60)}`)
    } else if (Array.isArray(value)) {
      // Reordering, dropping, or repeating elements keeps a list's type, not a tuple's.
      if (!homogeneous(value)) typed = false
      const choice = random.int(6)
      if (choice === 0) {
        slot.set([])
        changes.push(`${label} = []`)
      } else if (choice === 1 && value.length) {
        const copy = clone(value)
        copy.splice(random.int(copy.length), 1)
        slot.set(copy)
        changes.push(`${label}: dropped an element`)
      } else if (choice === 2 && value.length) {
        slot.set([...value, clone(value[random.int(value.length)])])
        changes.push(`${label}: duplicated an element`)
      } else if (choice === 3) {
        slot.set([...value].reverse())
        changes.push(`${label}: reversed`)
      } else if (choice === 4 && value.length) {
        const copy: unknown[] = []
        for (let i = 0; i < 200; i++) copy.push(clone(value[i % value.length]))
        slot.set(copy)
        changes.push(`${label}: 200 elements`)
      } else {
        let nested: unknown = value
        for (let i = 0; i < 64; i++) nested = [nested]
        slot.set(nested)
        typed = false
        changes.push(`${label}: nested 64 deep (wrong type)`)
      }
    } else if (
      value &&
      typeof value === 'object' &&
      !opaque.has(value) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(value))
    ) {
      const record = value as Record<string, unknown>
      const keys = Object.keys(record)
      if (keys.length && random.next() < 0.5) {
        const key = random.pick(keys)
        delete record[key]
        if (keepsType(shapes, slot.path, record, args))
          changes.push(`${label}.${key} left out`)
        else {
          typed = false
          changes.push(`${label}.${key} left out (required)`)
        }
      } else {
        // A field the type may not list, or one it lists with another type: neither is known to
        // keep the declared type (a record such as EIP-712 `types` lists every key).
        const key = random.pick(['extra', 'type', 'value', 'data', 'to'])
        const next = random.pick([1n, '0x01', 'x', 0, true, null])
        record[key] = next
        typed = false
        changes.push(
          `${label}.${key} = ${format(next)} (unknown or mistyped field)`,
        )
      }
    } else continue
  }
  return { args, typed, changes }
}
