export function parseUnits(value: `${number}`, decimals: number) {
  let [integer, fraction = '0'] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)

  // trim leading zeros.
  fraction = fraction.replace(/(0+)$/, '')

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    integer = `${Math.round(Number(`${integer}.${fraction}`))}`
    fraction = ''
  } else if (fraction.length > decimals) {
    const [before, after] = [
      fraction.slice(0, decimals),
      fraction.slice(decimals),
    ]
    fraction = `${before.slice(0, before.length - 1)}${Math.round(
      Number(`${before.slice(-1)}.${after}`),
    )}`
  } else {
    fraction = fraction.padEnd(decimals, '0')
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}
