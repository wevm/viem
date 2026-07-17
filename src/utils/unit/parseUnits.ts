import { InvalidDecimalNumberError } from '../../errors/unit.js'
import type { ErrorType } from '../../errors/utils.js'

export type ParseUnitsErrorType = ErrorType

/**
 * Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
 *
 * - Docs: https://viem.sh/docs/utilities/parseUnits
 *
 * @example
 * import { parseUnits } from 'viem'
 *
 * parseUnits('420', 9)
 * // 420000000000n
 */
export function parseUnits(value: string, decimals: number) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value })

  let [integer, fraction = '0'] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)

  // trim trailing zeros.
  fraction = fraction.replace(/(0+)$/, '')

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (fraction[0] && fraction[0] >= '5') integer = `${BigInt(integer) + 1n}`
    fraction = ''
  } else if (fraction.length > decimals) {
    const [left, right] = [
      fraction.slice(0, decimals),
      fraction.slice(decimals),
    ]

    if ((right[0] ?? '0') >= '5')
      fraction = `${BigInt(left) + 1n}`.padStart(left.length, '0')
    else fraction = left

    if (fraction.length > decimals) {
      fraction = fraction.slice(1)
      integer = `${BigInt(integer) + 1n}`
    }

    fraction = fraction.slice(0, decimals)
  } else {
    fraction = fraction.padEnd(decimals, '0')
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}
