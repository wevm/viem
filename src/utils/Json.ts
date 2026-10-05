export * from 'ox/Json'

/**
 * Pretty-prints a JSON-like value into an aligned, human-readable block.
 *
 * Renders objects as aligned `key: value` entries and arrays as indented
 * bullet lists, recursing into nested arrays and objects. Scalars render
 * inline; `bigint` is rendered via `toString` (never throwing like
 * `JSON.stringify`); empty arrays/objects render as `[]`/`{}`. Circular
 * references are rendered as `[Circular]` instead of throwing.
 *
 * @example
 * ```ts
 * import { Json } from 'viem/utils'
 *
 * Json.prettyPrint({
 *   from: '0x0000000000000000000000000000000000000000',
 *   accessList: [
 *     { address: '0x1111111111111111111111111111111111111111', storageKeys: ['0x0'] },
 *   ],
 * })
 * // from:        0x0000000000000000000000000000000000000000
 * // accessList:
 * //   - address:      0x1111111111111111111111111111111111111111
 * //     storageKeys:
 * //       - 0x0
 * ```
 *
 * @param value - The value to pretty-print.
 * @param options - Options.
 * @returns The pretty-printed block.
 */
export function prettyPrint(
  value: prettyPrint.Value,
  options: prettyPrint.Options = {},
): string {
  return format(value, options.indent ?? 0, new WeakSet()).join('\n')
}

export declare namespace prettyPrint {
  type Value =
    | bigint
    | boolean
    | number
    | string
    | null
    | undefined
    | readonly Value[]
    | { readonly [key: string]: Value }

  type Options = {
    /** Leading indentation (in spaces) applied to the top level. @default 0 */
    indent?: number | undefined
  }
}

/** Renders a value as a block of lines at the given indentation. */
function format(
  value: prettyPrint.Value,
  indent: number,
  seen: WeakSet<object>,
): string[] {
  const inlined = inline(value)
  if (inlined !== undefined) return [`${space(indent)}${inlined}`]

  // `value` is a non-empty array or object. Callers (`formatEntry`,
  // `renderArray`) check `seen` before recursing here, so cycles back to an
  // ancestor are already short-circuited as `[Circular]` upstream.
  const container = value as Container
  seen.add(container)
  const lines = Array.isArray(container)
    ? renderArray(container, indent, seen)
    : renderObject(container as Record, indent, seen)
  seen.delete(container)
  return lines
}

/** Renders an object's entries as aligned `key: value` lines. */
function renderObject(
  value: Record,
  indent: number,
  seen: WeakSet<object>,
): string[] {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  const maxLength = entries.reduce((max, [key]) => Math.max(max, key.length), 0)
  return entries.flatMap(([key, value]) =>
    formatEntry({
      key,
      value,
      maxLength,
      prefix: space(indent),
      childIndent: indent + 2,
      seen,
    }),
  )
}

/** Renders an array's items as indented bullet (`- `) lines. */
function renderArray(
  value: readonly prettyPrint.Value[],
  indent: number,
  seen: WeakSet<object>,
): string[] {
  return value.flatMap((item) => {
    const inlined = inline(item)
    if (inlined !== undefined) return [`${space(indent)}- ${inlined}`]

    const container = item as Container
    if (seen.has(container)) return [`${space(indent)}- [Circular]`]
    seen.add(container)
    const lines = Array.isArray(container)
      ? [`${space(indent)}-`, ...renderArray(container, indent + 2, seen)]
      : renderArrayObject(container as Record, indent, seen)
    seen.delete(container)
    return lines
  })
}

/** Renders an object that is an array item, prefixing its first key with `- `. */
function renderArrayObject(
  value: Record,
  indent: number,
  seen: WeakSet<object>,
): string[] {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  const maxLength = entries.reduce((max, [key]) => Math.max(max, key.length), 0)
  return entries.flatMap(([key, value], index) =>
    formatEntry({
      key,
      value,
      maxLength,
      prefix: index === 0 ? `${space(indent)}- ` : space(indent + 2),
      childIndent: indent + 4,
      seen,
    }),
  )
}

type FormatEntryOptions = {
  key: string
  value: prettyPrint.Value
  maxLength: number
  prefix: string
  childIndent: number
  seen: WeakSet<object>
}

/** Renders a single `key: value` entry (inline when possible, else a block). */
function formatEntry(options: FormatEntryOptions): string[] {
  const { key, value, maxLength, prefix, childIndent, seen } = options
  const label = `${key}:`.padEnd(maxLength + 1)
  const inlined = inline(value)
  if (inlined !== undefined) return [`${prefix}${label}  ${inlined}`]
  if (seen.has(value as Container)) return [`${prefix}${label}  [Circular]`]
  return [`${prefix}${key}:`, ...format(value, childIndent, seen)]
}

/** Returns the inline string for a scalar or empty container, else `undefined`. */
function inline(value: prettyPrint.Value): string | undefined {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.length === 0 ? '[]' : undefined
  return Object.keys(value).length === 0 ? '{}' : undefined
}

function space(count: number): string {
  return ' '.repeat(count)
}

type Record = { readonly [key: string]: prettyPrint.Value }
type Container = readonly prettyPrint.Value[] | Record
