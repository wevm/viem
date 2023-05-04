import type { Formatter } from '../../types/formatter.js'

/**
 * @description Picks out the keys from `value` that exist in the formatter.
 */
export function extract(
  value: Record<string, unknown>,
  { formatter }: { formatter?: Formatter },
) {
  if (!formatter) return {}
  const keys = Object.keys(formatter({}))
  return keys.reduce((data, key) => {
    if (value?.hasOwnProperty(key)) {
      ;(data as any)[key] = value[key]
    }
    return data
  }, {})
}
