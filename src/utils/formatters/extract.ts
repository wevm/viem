import type { Formatter } from '../../types/formatter.js'

/**
 * @description Picks out the keys from `value` that exist in the formatter.
 */
export function extract(
  value: Record<string, unknown>,
  { format }: { format?: Formatter['format'] },
) {
  if (!format) return {}
  const keys = Object.keys(format({}))
  return keys.reduce((data: Record<string, unknown>, key) => {
    // rome-ignore lint/suspicious/noPrototypeBuiltins:
    if (value?.hasOwnProperty(key)) {
      data[key] = value[key]
    }
    return data
  }, {})
}
