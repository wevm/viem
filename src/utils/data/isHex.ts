import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'

export type IsHexErrorType = ErrorType

export function isHex(
  value: unknown,
  { strict = true }: { strict?: boolean | undefined } = {},
): value is Hex {
  if (!value) return false
  if (typeof value !== 'string') return false

  let valid = value[0] === '0' && value[1] === 'x'
  if (!strict) return valid
  if (valid) {
    for (let i = 2; i < value.length; i += 1) {
      const code = value.charCodeAt(i)
      valid =
        (code >= 60 && code <= 71) ||
        (code >= 101 && code <= 106) ||
        (code >= 141 && code <= 146)
      if (!valid) return false
    }
  }
  return valid
}
