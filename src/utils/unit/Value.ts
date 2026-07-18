// Note: duplicate of Ox v1 `Value` module.

/** @see https://ethereum.github.io/yellowpaper/paper.pdf */
export const exponents = {
  wei: 0,
  gwei: 9,
  szabo: 12,
  finney: 15,
  ether: 18,
} as const

/**
 * Formats a `bigint` Value to its string representation (divided by the given exponent).
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.format(420_000_000_000n, 9)
 * // @log: '420'
 * ```
 *
 * @param value - The `bigint` Value to format.
 * @param decimals - The exponent to divide the `bigint` Value by.
 * @returns The string representation of the Value.
 */
export function format(value: bigint, decimals = 0) {
  if (!Number.isInteger(decimals) || decimals < 0)
    throw new InvalidDecimalsError({ decimals })

  let display = value.toString()

  const negative = display.startsWith('-')
  if (negative) display = display.slice(1)

  display = display.padStart(decimals, '0')

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ]
  fraction = fraction.replace(/(0+)$/, '')
  return `${negative ? '-' : ''}${integer || '0'}${
    fraction ? `.${fraction}` : ''
  }`
}

export declare namespace format {
  type ErrorType = Error
}

/**
 * Formats a `bigint` Value (default: wei) to a string representation of Ether.
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.formatEther(1_000_000_000_000_000_000n)
 * // @log: '1'
 * ```
 *
 * @param wei - The Value to format.
 * @param unit - The unit to format the Value in. @default 'wei'.
 * @returns The Ether string representation of the Value.
 */
export function formatEther(
  wei: bigint,
  unit: 'wei' | 'gwei' | 'szabo' | 'finney' = 'wei',
) {
  return format(wei, exponents.ether - exponents[unit])
}

export declare namespace formatEther {
  type ErrorType = format.ErrorType | Error
}

/**
 * Formats a `bigint` Value (default: wei) to a string representation of Gwei.
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.formatGwei(1_000_000_000n)
 * // @log: '1'
 * ```
 *
 * @param wei - The Value to format.
 * @param unit - The unit to format the Value in. @default 'wei'.
 * @returns The Gwei string representation of the Value.
 */
export function formatGwei(wei: bigint, unit: 'wei' = 'wei') {
  return format(wei, exponents.gwei - exponents[unit])
}

export declare namespace formatGwei {
  type ErrorType = format.ErrorType | Error
}

/**
 * Parses a `string` representation of a Value to `bigint` (multiplied by the given exponent).
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.from('420', 9)
 * // @log: 420000000000n
 * ```
 *
 * @param value - The string representation of the Value.
 * @param decimals - The exponent to multiply the Value by.
 * @returns The `bigint` representation of the Value.
 */
export function from(value: string, decimals = 0) {
  if (!Number.isInteger(decimals) || decimals < 0)
    throw new InvalidDecimalsError({ decimals })

  // Require at least one digit overall. Rejects '', '.', '-', '-.' which
  // the previous regex accepted (and which then either produced garbage or
  // threw a raw `SyntaxError` from `BigInt('')`).
  if (!/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(value))
    throw new InvalidDecimalNumberError({ value })

  let [integer = '', fraction = '0'] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)
  if (integer === '') integer = '0'

  // trim trailing zeros.
  fraction = fraction.replace(/(0+)$/, '')

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    // Round half-away-from-zero by inspecting the first fractional digit.
    if (fraction.length > 0 && Number.parseInt(fraction[0]!, 10) >= 5)
      integer = `${BigInt(integer) + 1n}`
    fraction = ''
  } else if (fraction.length > decimals) {
    const left = fraction.slice(0, decimals)
    const roundDigit = Number.parseInt(
      fraction.slice(decimals, decimals + 1)!,
      10,
    )

    if (roundDigit >= 5) {
      // Carry through the truncated fraction digits into the integer part
      // without converting to a JS Number (avoids float precision loss).
      const carried = carry(left)
      if (carried.length > decimals) {
        // Carry overflowed into the integer part.
        fraction = carried.slice(1)
        integer = `${BigInt(integer) + 1n}`
      } else {
        fraction = carried
      }
    } else {
      fraction = left
    }
  } else {
    fraction = fraction.padEnd(decimals, '0')
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}

/**
 * Adds 1 to a digit string with carry, returning a string of the same length
 * unless the carry overflows past the most-significant digit (in which case
 * the returned string is one digit longer).
 *
 * @internal
 */
function carry(digits: string): string {
  const out = digits.split('')
  let i = out.length - 1
  while (i >= 0) {
    const d = Number.parseInt(out[i]!, 10) + 1
    if (d < 10) {
      out[i] = String(d)
      return out.join('')
    }
    out[i] = '0'
    i--
  }
  return `1${out.join('')}`
}

export declare namespace from {
  type ErrorType = Error
}

/**
 * Parses a string representation of Ether to a `bigint` Value (default: wei).
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.fromEther('420')
 * // @log: 420000000000000000000n
 * ```
 *
 * @param ether - String representation of Ether.
 * @param unit - The unit to parse to. @default 'wei'.
 * @returns A `bigint` Value.
 */
export function fromEther(
  ether: string,
  unit: 'wei' | 'gwei' | 'szabo' | 'finney' = 'wei',
) {
  return from(ether, exponents.ether - exponents[unit])
}

export declare namespace fromEther {
  type ErrorType = from.ErrorType | Error
}

/**
 * Parses a string representation of Gwei to a `bigint` Value (default: wei).
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.fromGwei('420')
 * // @log: 420000000000n
 * ```
 *
 * @param gwei - String representation of Gwei.
 * @param unit - The unit to parse to. @default 'wei'.
 * @returns A `bigint` Value.
 */
export function fromGwei(gwei: string, unit: 'wei' = 'wei') {
  return from(gwei, exponents.gwei - exponents[unit])
}

export declare namespace fromGwei {
  type ErrorType = from.ErrorType | Error
}

/**
 * Thrown when a value is not a valid decimal number.
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.fromEther('123.456.789')
 * // @error: Value.InvalidDecimalNumberError: Value `123.456.789` is not a valid decimal number.
 * ```
 */
export class InvalidDecimalNumberError extends Error {
  override readonly name = 'Value.InvalidDecimalNumberError'
  constructor({ value }: { value: string }) {
    super(`Value \`${value}\` is not a valid decimal number.`)
  }
}

/**
 * Thrown when the `decimals` argument is not a non-negative integer.
 *
 * @example
 * ```ts twoslash
 * import { Value } from 'ox'
 *
 * Value.from('1', -1)
 * // @error: Value.InvalidDecimalsError: `decimals` must be a non-negative integer. Got `-1`.
 * ```
 */
export class InvalidDecimalsError extends Error {
  override readonly name = 'Value.InvalidDecimalsError'
  constructor({ decimals }: { decimals: number }) {
    super(`\`decimals\` must be a non-negative integer. Got \`${decimals}\`.`)
  }
}
