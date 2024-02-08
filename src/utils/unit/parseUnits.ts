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
export function parseUnits(value_: string, decimals: number) {
  const value = value_.includes('e') ? scientificToDecimal(value_) : value_

  let [integer, fraction = '0'] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)

  // trim leading zeros.
  fraction = fraction.replace(/(0+)$/, '')

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`
    fraction = ''
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals),
    ]

    const rounded = Math.round(Number(`${unit}.${right}`))
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, '0')
    else fraction = `${left}${rounded}`

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

export function scientificToDecimal(value: string) {
  const [coefficient, exponent] = value.toLowerCase().split('e')
  let [whole, fraction = ''] = coefficient.split('.')

  const negative = whole.startsWith('-')
  if (negative) whole = whole.slice(1)

  // Combine whole and fraction parts into an integer.
  const integer = `${whole}${fraction}`

  // If the number is 0, return 0.
  if (integer === '0') return integer

  // Get shifted number.
  const shifted = (() => {
    if (Number(exponent) < 0) {
      const zeroes = Math.abs(Number(exponent)) - whole.length
      const paddedInteger = `${zeroes > 0 ? '0'.repeat(zeroes) : ''}${whole}`
      const [left, right] = [
        paddedInteger.slice(0, Number(exponent)),
        paddedInteger.slice(Number(exponent)),
      ]
      // e.g. 123.456e-2 => 1.23456    (negative zeroes)
      //      123.456e-4 => 0.0123456  (positive zeroes)
      return `${left || '0'}.${right}${fraction}`
    }

    const zeroes = Number(exponent) - fraction.length

    if (zeroes < 0) {
      const [whole, fraction] = [
        integer.slice(0, zeroes),
        integer.slice(zeroes),
      ]
      // e.g. 123.456e2 => 12345.6
      return `${whole}.${fraction}`
    }

    // e.g. 123.456e5 => 12345600
    return `${integer}${'0'.repeat(zeroes)}`
  })()

  // Form the signed number.
  return `${negative ? '-' : ''}${shifted}`
}
