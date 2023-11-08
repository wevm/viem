import type { ErrorType } from '../../errors/utils.js'

export type FormatUnitsErrorType = ErrorType

/**
 * Takes a bigint and converts it to a string with the correct number of decimal places
 *
 * Example: formatUnits(420000000000n, 9) -> '420'
 */
export function formatUnits(value: bigint, decimals: number) {
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
