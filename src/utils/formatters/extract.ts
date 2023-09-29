import type { ErrorType } from '../../errors/utils.js'
import type { ChainFormatter } from '../../types/chain.js'

export type ExtractErrorType = ErrorType

/**
 * @description Picks out the keys from `value` that exist in the formatter.
 */
export function extract(
  value: Record<string, unknown>,
  { format }: { format?: ChainFormatter['format'] },
) {
  if (!format) return {}
  const keys = Object.keys(format({}))
  return keys.reduce((data: Record<string, unknown>, key) => {
    // biome-ignore lint/suspicious/noPrototypeBuiltins:
    if (value?.hasOwnProperty(key)) {
      data[key] = value[key]
    }
    return data
  }, {})
}
