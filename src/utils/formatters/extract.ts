import type { ErrorType } from '../../errors/utils.js'
import type { ChainFormatter } from '../../types/chain.js'

export type ExtractErrorType = ErrorType

/**
 * @description Picks out the keys from `value` that exist in the formatter..
 */
export function extract(
  value_: Record<string, unknown>,
  { format }: { format?: ChainFormatter['format'] },
) {
  if (!format) return {}

  const value: Record<string, unknown> = {}
  function extract_(formatted: Record<string, any>) {
    const keys = Object.keys(formatted)
    for (const key of keys) {
      if (key in value_) value[key] = value_[key]
      if (
        formatted[key] &&
        typeof formatted[key] === 'object' &&
        !Array.isArray(formatted[key])
      )
        extract_(formatted[key])
    }
  }

  const formatted = format(value_ || {})
  extract_(formatted)

  return value
}
