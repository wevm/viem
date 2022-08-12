export function toUnit(value: string, decimals: number) {
  let [integer, fraction = '0'] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)

  // trim leading zeros
  fraction = fraction.replace(/(0+)$/, '')

  // check if we can create a whole number
  if (fraction.length > decimals) {
    throw new Error(
      `cannot create a whole number from ${value} by shifting ${decimals} decimals`,
    )
  }

  fraction = fraction.padEnd(decimals, '0')

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}
