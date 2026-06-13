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

  let [integer = '', fraction = ''] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)

  // trim trailing zeros.
  fraction = fraction.replace(/(0+)$/, '')

  // Fraction fits within `decimals`: just pad it out, nothing to round.
  if (fraction.length <= decimals) {
    fraction = fraction.padEnd(decimals, '0')
    return BigInt(`${negative ? '-' : ''}${integer || '0'}${fraction}`)
  }

  // Fraction is longer than `decimals`: round half-up based on the first
  // dropped digit. We compare the digit *characters* directly instead of
  // routing the fraction through a JS float (the previous implementation used
  // `Math.round(Number(...))`). `Number('.4999999999999999999')` evaluates to
  // `0.5` due to float precision, which rounded a value strictly *below* the
  // midpoint up by a whole unit. Concatenating the kept digits into a single
  // BigInt also lets the carry propagate into the integer part automatically.
  const keep = fraction.slice(0, decimals)
  const roundUp = fraction[decimals] >= '5'
  let scaled = BigInt(`${integer || '0'}${keep}`)
  if (roundUp) scaled += 1n
  return BigInt(negative ? '-1' : '1') * scaled
}
