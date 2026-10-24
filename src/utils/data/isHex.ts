import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'

export type IsHexErrorType = ErrorType

export function isHex(
  value: unknown,
  {
    even = false,
    strict = true,
  }: {
    /**
     * Whether or not to require an even number of hex characters (whole bytes).
     *
     * @default false
     */
    even?: boolean | undefined
    /**
     * Whether or not to require only hex characters after the `0x` prefix.
     *
     * @default true
     */
    strict?: boolean | undefined
  } = {},
): value is Hex {
  if (!value) return false
  if (typeof value !== 'string') return false
  if (even && value.length % 2 !== 0) return false
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith('0x')
}
