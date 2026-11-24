/**
 * Encodes a call's arguments as JSON text that another process can rebuild, and rebuilds them.
 * Shared by the recorder, which runs inside vitest, and the bench worker, which runs under Node,
 * so both sides agree on what is replayable and on what an argument set looks like.
 *
 * Replayable values are primitives (including `undefined`, `-0`, `NaN`, and infinities), bigints,
 * `Uint8Array`s (a `Buffer` rebuilds as a plain `Uint8Array`), `Date`s, plain objects, and arrays.
 * Beyond those, in the order they are tried:
 *
 * - A value a viem module exports, or reaches through an export's properties, such as a chain,
 *   an ABI, or an action passed to another action, encodes as that path, `{ $ref: key }`, and is
 *   rebuilt by importing it.
 * - A client encodes as its configuration (chain, account, polling interval, and so on) and the
 *   JSON-RPC exchanges its requests got during the call, `{ $client, $rpc }`. It is rebuilt as a
 *   client whose transport answers each request from those exchanges, so a replayed action does
 *   its own work (building requests, formatting, encoding and decoding) without a node.
 * - A value a recorded call to a viem export returned from replayable arguments, such as an
 *   account or a transport, encodes as that call, `{ $call: key, $args }`, and is rebuilt by
 *   making the call again; a value an async export resolved to, such as a smart account, encodes
 *   as `{ $await: key, $args }`. An instance of an exported class, such as a viem error, encodes the
 *   same way as its construction, `{ $new: key, $args }`.
 * - A function whose source refers to nothing but its own parameters, locals, and standard
 *   globals, such as `(x) => x * 2n`, encodes as its source, `{ $fn }`. A function that closes
 *   over anything else, as test callbacks that push to an array do, is not replayable, except
 *   an event callback such as `onLogs`, whose result viem ignores, which rebuilds as a no-op,
 *   `{ $noop: 1 }`.
 *
 * Anything else makes the call unreplayable, and the error says why in words a reader of a
 * `benched` note understands, such as "passes a function".
 *
 * @module
 */

import * as acorn from 'acorn'

/** Largest encoded argument set kept, which fits a few 128kB blobs as hex. */
export const maxEncodedLength = 1_200_000

/** Why a call's arguments cannot be rebuilt in another process. */
export class Unreplayable extends Error {
  reason: string
  constructor(reason: string) {
    super(reason)
    this.reason = reason
  }
}

/** The recorded call that returned a value: the export's key, the raw arguments, and whether it was `new`. */
export type Origin = {
  key: string
  args: readonly unknown[]
  construct?: boolean | undefined
  /** The call returned a promise, and the value is what it resolved to. */
  async?: boolean | undefined
}

/** What the recorder knows about values the plain encoding cannot carry. */
export type Hooks = {
  /** The recorded calls that returned a value, the one to try first first. */
  origin?: ((value: object) => readonly Origin[] | undefined) | undefined
  /** The export path a value is reachable at, such as `src/chains/definitions/mainnet.ts#mainnet`. */
  ref?: ((value: object) => string | undefined) | undefined
  /** What stands for a client's JSON-RPC exchanges in the encoding, filled in once the call settles. */
  rpc?: ((client: object) => string | undefined) | undefined
  /** The encoded form of a value `decode` rebuilt, so encoding it again yields the same text. */
  known?: ((value: object) => unknown) | undefined
  /** Whether a function that uses nothing but standard globals encodes as its source. */
  sources?: boolean | undefined
}

/** How `decode` rebuilds the values that are not plain data. */
export type Rebuild = {
  /** Makes a recorded call again. */
  call: (key: string, args: unknown[]) => unknown
  /** Constructs a recorded class instance, such as an error, again. */
  construct: (key: string, args: unknown[]) => unknown
  /** The value at an export path. */
  ref: (key: string) => unknown
  /** A client with this configuration whose transport answers from these exchanges. */
  client: (config: Record<string, unknown>, rpc: RpcExchange[]) => unknown
}

/** One JSON-RPC request a client made and what it got: `[method, params, ok, result or error]`. */
export type RpcExchange = [
  method: string,
  params: unknown,
  ok: 0 | 1,
  value: unknown,
]

type Context = {
  seen: Set<object>
  depth: number
  hooks: Hooks
  /** Values whose recorded call's arguments are being encoded, so a call passing its own result fails. */
  pending: Set<object>
}

/**
 * Encodes `args` as JSON text, or throws `Unreplayable`. `hooks` say how to carry values the plain
 * encoding cannot.
 */
export function encode(args: readonly unknown[], hooks: Hooks = {}): string {
  const context = {
    seen: new Set<object>(),
    depth: 0,
    hooks,
    pending: new Set<object>(),
  }
  const text = JSON.stringify(args.map((arg) => encodeValue(arg, context)))
  if (text.length > maxEncodedLength)
    throw new Unreplayable('passes arguments over 1.2MB')
  return text
}

/** Encodes one plain value, such as JSON-RPC params or a result, as JSON text. */
export function encodePlain(value: unknown): string {
  return JSON.stringify(
    encodeValue(value, {
      seen: new Set(),
      depth: 0,
      hooks: {},
      pending: new Set(),
    }),
  )
}

/** The export keys `decode` needs to rebuild values, so their modules can load first. */
export function keys(text: string): string[] {
  return [
    ...new Set(
      [...text.matchAll(/"\$(?:await|call|new|ref)":"([^"]+)"/g)].map(
        (m) => m[1]!,
      ),
    ),
  ]
}

/**
 * Rebuilds the arguments `encode` wrote. It is async because a value an async export resolved to,
 * such as a smart account, is rebuilt by awaiting the call again. `origins` learns the encoded
 * form of each value rebuilt from a call, an export, a client, or a source, so encoding the
 * arguments again with `known: (value) => origins.get(value)` yields the same text.
 */
export async function decode(
  text: string,
  rebuild?: Rebuild,
  origins?: Map<object, unknown>,
): Promise<unknown[]> {
  const need = () => {
    if (!rebuild) throw new Error('decode needs `rebuild` to rebuild values')
    return rebuild
  }
  const remember = (result: unknown, node: unknown) => {
    if (result && (typeof result === 'object' || typeof result === 'function'))
      origins?.set(result, node)
    return result
  }
  const decodeAll = async (values: unknown[]) => {
    const out: unknown[] = []
    for (const value of values) out.push(await decodeValue(value))
    return out
  }
  const decodeValue = async (value: unknown): Promise<unknown> => {
    if (value === null || typeof value !== 'object') return value
    if (Array.isArray(value)) {
      const out: unknown[] = []
      for (let i = 0; i < value.length; i++) {
        const item = value[i] as { hole?: number } | null
        if (item && typeof item === 'object' && item.hole === 1)
          out.length = i + 1
        else out[i] = await decodeValue(item)
      }
      return out
    }
    const record = value as Record<string, unknown>
    if ('$ref' in record)
      return remember(need().ref(record.$ref as string), record)
    if ('$call' in record) {
      const args = await decodeAll(record.$args as unknown[])
      return remember(need().call(record.$call as string, args), record)
    }
    if ('$await' in record) {
      const args = await decodeAll(record.$args as unknown[])
      return remember(await need().call(record.$await as string, args), record)
    }
    if ('$new' in record) {
      const args = await decodeAll(record.$args as unknown[])
      return remember(need().construct(record.$new as string, args), record)
    }
    if ('$client' in record) {
      const config = (await decodeValue(record.$client)) as Record<
        string,
        unknown
      >
      return remember(
        need().client(config, record.$rpc as RpcExchange[]),
        record,
      )
    }
    if ('$noop' in record) return remember(() => {}, record)
    if ('$fn' in record)
      return remember(
        new Function(`return (${record.$fn as string})`)(),
        record,
      )
    if (
      '$u' in record ||
      '$b' in record ||
      '$n' in record ||
      '$u8' in record ||
      '$d' in record
    )
      return decodePlain(record)
    const source = ('$o' in record ? record.$o : record) as Record<
      string,
      unknown
    >
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(source))
      out[key] = await decodeValue(source[key])
    return out
  }
  return decodeAll(JSON.parse(text) as unknown[])
}

/** Rebuilds a plain value `encodePlain` wrote, such as JSON-RPC params or a result. */
export function decodePlain(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    const out: unknown[] = []
    for (let i = 0; i < value.length; i++) {
      const item = value[i] as { hole?: number } | null
      if (item && typeof item === 'object' && item.hole === 1)
        out.length = i + 1
      else out[i] = decodePlain(item)
    }
    return out
  }
  const record = value as Record<string, unknown>
  if ('$u' in record) return undefined
  if ('$b' in record) return BigInt(record.$b as string)
  if ('$n' in record) return Number(record.$n)
  if ('$u8' in record) return fromHex(record.$u8 as string)
  if ('$d' in record) return new Date(record.$d as number)
  const source = ('$o' in record ? record.$o : record) as Record<
    string,
    unknown
  >
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(source)) out[key] = decodePlain(source[key])
  return out
}

function encodeValue(value: unknown, context: Context): unknown {
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return value
    case 'number':
      return Number.isFinite(value) && !Object.is(value, -0)
        ? value
        : { $n: Object.is(value, -0) ? '-0' : String(value) }
    case 'undefined':
      return { $u: 1 }
    case 'bigint':
      return { $b: value.toString() }
    case 'symbol':
      throw new Unreplayable('passes a symbol')
  }
  if (value === null) return null
  const object = value as object
  if (object instanceof Uint8Array) return { $u8: toHex(object) }
  if (object instanceof Date) return { $d: object.getTime() }
  const { hooks } = context
  const known = hooks.known?.(object)
  if (known !== undefined) return known
  const ref = hooks.ref?.(object)
  if (ref !== undefined) return { $ref: ref }
  if (isClient(object)) return encodeClient(object, context)
  try {
    return encodeStructure(object, context)
  } catch (error) {
    if (!(error instanceof Unreplayable)) throw error
    // A value several calls returned, such as an account `fromSecp256k1` made with `from`, tries
    // the outermost call first. A call whose arguments cannot be encoded leaves the value's own
    // reason, such as "passes a client", which says more than its call's.
    const origins = hooks.origin?.(object) ?? []
    if (origins.length && context.depth <= 4 && !context.pending.has(object)) {
      context.depth++
      context.pending.add(object)
      try {
        for (const origin of origins)
          try {
            const args = origin.args.map((arg) => encodeValue(arg, context))
            if (origin.construct) return { $new: origin.key, $args: args }
            if (origin.async) return { $await: origin.key, $args: args }
            return { $call: origin.key, $args: args }
          } catch {}
      } finally {
        context.depth--
        context.pending.delete(object)
      }
    }
    if (typeof object === 'function' && hooks.sources) {
      const source = sourceOf(object)
      if (source !== undefined) return { $fn: source }
    }
    throw error
  }
}

function encodeStructure(object: object, context: Context): unknown {
  if (typeof object === 'function')
    throw new Unreplayable(
      /^class[\s{]/.test(Function.prototype.toString.call(object))
        ? 'passes a class'
        : 'passes a function',
    )
  const { seen } = context
  if (seen.has(object)) throw new Unreplayable('passes a cyclic object')
  const proto = Object.getPrototypeOf(object)
  seen.add(object)
  try {
    if (Array.isArray(object)) {
      if (proto !== Array.prototype)
        throw new Unreplayable('passes an array subclass')
      const out: unknown[] = []
      for (let i = 0; i < object.length; i++)
        out.push(
          i in object ? encodeValue(object[i], context) : { $u: 1, hole: 1 },
        )
      return out
    }
    if (proto !== Object.prototype && proto !== null)
      throw new Unreplayable(`passes ${describeInstance(object)}`)
    const record = object as Record<string, unknown>
    if (typeof record.request === 'function')
      throw new Unreplayable('passes a provider')
    if (
      typeof record.address === 'string' &&
      (typeof record.signMessage === 'function' ||
        typeof record.sign === 'function' ||
        record.type === 'local' ||
        record.type === 'smart')
    )
      throw new Unreplayable('passes an account')
    const out: Record<string, unknown> = {}
    let escaped = false
    // A chain's `extend`, which `defineChain` and each `chain.extend(...)` add as a closure, is
    // left out: no viem function calls it, and tests pass chains they extended.
    const chain =
      typeof record.id === 'number' &&
      typeof record.name === 'string' &&
      typeof record.extend === 'function'
    for (const key of Object.keys(record)) {
      if (key.startsWith('$')) escaped = true
      if (chain && key === 'extend') continue
      let item: unknown
      try {
        item = record[key]
      } catch {
        throw new Unreplayable('passes an object with a throwing getter')
      }
      try {
        out[key] = encodeValue(item, context)
      } catch (error) {
        // viem ignores what an event callback such as `onLogs` returns, so one that closes over
        // the test's state, as most do, replays as a callback that does nothing.
        if (
          !(error instanceof Unreplayable) ||
          typeof item !== 'function' ||
          !/^on[A-Z]/.test(key) ||
          resultUsed.has(key)
        )
          throw error
        out[key] = { $noop: 1 }
      }
    }
    return escaped ? { $o: out } : out
  } finally {
    seen.delete(object)
  }
}

/** Callbacks named like events whose result viem uses, so a no-op cannot stand in for them. */
const resultUsed = new Set(['onRequest', 'onFetchRequest', 'onSponsored'])

/** A viem client: a plain object with a `request` function and a `transport`. */
function isClient(object: object): object is Record<string, unknown> {
  if (typeof object !== 'object') return false
  const proto = Object.getPrototypeOf(object)
  if (proto !== Object.prototype && proto !== null) return false
  const record = object as Record<string, unknown>
  return (
    typeof record.request === 'function' &&
    !!record.transport &&
    typeof record.transport === 'object'
  )
}

/** Properties of a client that the rebuilt client makes anew. */
const clientOwn = new Set(['request', 'transport', 'extend', 'scope', 'uid'])

/**
 * A client's configuration, without the actions decorators added (`getBalance`, `token`, and so
 * on), which call the same functions the replayed action calls directly, and the transport's
 * plain configuration, such as its `type` and `url`.
 */
function encodeClient(client: Record<string, unknown>, context: Context) {
  const rpc = context.hooks.rpc?.(client)
  if (rpc === undefined) throw new Unreplayable('passes a client')
  const { seen } = context
  if (seen.has(client)) throw new Unreplayable('passes a cyclic object')
  seen.add(client)
  try {
    const config: Record<string, unknown> = {}
    for (const key of Object.keys(client)) {
      if (clientOwn.has(key)) continue
      const value = client[key]
      if (typeof value === 'function' || isNamespace(value)) continue
      config[key] = encodeValue(value, context)
    }
    const transport: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(
      client.transport as Record<string, unknown>,
    )) {
      if (typeof value === 'function') continue
      try {
        transport[key] = encodeValue(value, context)
      } catch {}
    }
    config.transport = transport
    return { $client: config, $rpc: rpc }
  } finally {
    seen.delete(client)
  }
}

/** A plain object whose values are all functions or such objects, as decorators add. */
function isNamespace(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== 'object' || depth > 3) return false
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

/** Globals a function's source may use and still be rebuilt from its text in another process. */
const globals = new Set(
  `undefined NaN Infinity globalThis Object Array Function Boolean Number String Symbol BigInt
  Math JSON Date RegExp Error TypeError RangeError SyntaxError Promise Map Set WeakMap WeakSet
  ArrayBuffer DataView Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array
  Float32Array Float64Array BigInt64Array BigUint64Array TextEncoder TextDecoder parseInt
  parseFloat isNaN isFinite encodeURIComponent decodeURIComponent encodeURI decodeURI atob btoa
  setTimeout clearTimeout queueMicrotask structuredClone Reflect URL URLSearchParams
  AbortController AbortSignal Headers Response Request arguments`.split(/\s+/),
)

/**
 * The source of a function that can be rebuilt from its text alone, as an expression, or
 * `undefined` when it closes over anything but standard globals.
 */
function sourceOf(fn: Function): string | undefined {
  let text: string
  try {
    text = Function.prototype.toString.call(fn)
  } catch {
    return undefined
  }
  if (/\{\s*\[native code\]\s*\}$/.test(text) || /^class[\s{]/.test(text))
    return undefined
  const parse = (source: string) => {
    try {
      return acorn.parseExpressionAt(source, 0, {
        ecmaVersion: 'latest',
        preserveParens: true,
      })
    } catch {
      return undefined
    }
  }
  let expression = `(${text})`
  let node = parse(expression) as AstNode | undefined
  if (!node || node.end !== expression.length) {
    // A method, such as `format(args) { ... }`, is valid only inside an object literal.
    const object = `({${text}})`
    const parsed = parse(object) as AstNode | undefined
    const properties = (parsed?.expression as AstNode | undefined)?.properties
    const property = properties?.[0]
    if (
      !parsed ||
      parsed.end !== object.length ||
      properties?.length !== 1 ||
      property?.computed ||
      property?.key?.type !== 'Identifier'
    )
      return undefined
    expression = `${object}.${property.key.name}`
    node = parsed
  }
  return freeNames(node).every((name) => globals.has(name))
    ? expression
    : undefined
}

type AstNode = {
  type: string
  end: number
  name?: string
  computed?: boolean
  shorthand?: boolean
  key?: AstNode
  value?: AstNode
  properties?: AstNode[]
  [key: string]: unknown
}

/**
 * The names a function's source reads without declaring them. It treats a name declared anywhere
 * in the source as declared everywhere in it, which can only let a closure through as a function
 * that then throws when replayed, never reject a self-contained one.
 */
function freeNames(root: AstNode): string[] {
  const declared = new Set<string>()
  const used = new Set<string>()
  const declare = (pattern: AstNode | null | undefined) => {
    if (!pattern) return
    if (pattern.type === 'Identifier') declared.add(pattern.name!)
    else if (pattern.type === 'ObjectPattern')
      for (const property of pattern.properties!)
        if (property.type === 'RestElement')
          declare(property.argument as AstNode)
        else {
          if (property.computed) visit(property.key)
          declare(property.value)
        }
    else if (pattern.type === 'ArrayPattern')
      for (const element of pattern.elements as (AstNode | null)[])
        declare(element)
    else if (pattern.type === 'RestElement')
      declare(pattern.argument as AstNode)
    else if (pattern.type === 'AssignmentPattern') {
      declare(pattern.left as AstNode)
      visit(pattern.right as AstNode)
    } else visit(pattern)
  }
  const visit = (node: AstNode | null | undefined): void => {
    if (!node || typeof node.type !== 'string') return
    switch (node.type) {
      case 'Identifier':
        used.add(node.name!)
        return
      case 'FunctionExpression':
      case 'FunctionDeclaration':
      case 'ArrowFunctionExpression':
        declare(node.id as AstNode)
        for (const param of node.params as AstNode[]) declare(param)
        visit(node.body as AstNode)
        return
      case 'ClassDeclaration':
      case 'ClassExpression':
        declare(node.id as AstNode)
        visit(node.superClass as AstNode)
        visit(node.body as AstNode)
        return
      case 'VariableDeclarator':
        declare(node.id as AstNode)
        visit(node.init as AstNode)
        return
      case 'CatchClause':
        declare(node.param as AstNode)
        visit(node.body as AstNode)
        return
      case 'MemberExpression':
        visit(node.object as AstNode)
        if (node.computed) visit(node.property as AstNode)
        return
      case 'Property':
      case 'MethodDefinition':
      case 'PropertyDefinition':
        // A shorthand property's value is the identifier it reads.
        if (node.computed) visit(node.key)
        visit(node.value)
        return
      case 'LabeledStatement':
        visit(node.body as AstNode)
        return
      case 'BreakStatement':
      case 'ContinueStatement':
      case 'MetaProperty':
        return
    }
    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'start' || key === 'end') continue
      const child = node[key]
      if (Array.isArray(child)) for (const item of child) visit(item as AstNode)
      else if (child && typeof child === 'object') visit(child as AstNode)
    }
  }
  visit(root)
  return [...used].filter((name) => !declared.has(name))
}

function describeInstance(object: object): string {
  const name = (object as { constructor?: { name?: string } }).constructor?.name
  if (!name) return 'a class instance'
  if (name === 'Promise') return 'a promise'
  if (name.endsWith('Error') || object instanceof Error) return 'an error'
  return `a ${name}`
}

function toHex(bytes: Uint8Array): string {
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
