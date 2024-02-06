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
  const scientificToBigInt = (scientificNotation: string) => {
    const [coefficient, exponent] = scientificNotation.toLowerCase().split('e')
    const shift = parseFloat(exponent)
    if (shift >= 0) {
      return BigInt(parseFloat(scientificNotation)) * 10n ** BigInt(decimals)
    }
    if (Math.abs(shift) > decimals) {
      return BigInt(0)
    }
    if (Math.abs(shift) === decimals) {
      const integer = value.split('.')[0]
      return BigInt(integer)
    }
    return (
      BigInt(coefficient.replace('.', '')) * 10n ** BigInt(shift + decimals - 1)
    )
  }

  let [integer, fraction = '0'] = value.split('.')

  // Handle scientific notation
  if (value.toLowerCase().includes('e')) {
    return scientificToBigInt(value)
  }

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
