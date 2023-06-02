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
    // count number of starting zeros in before
    const zeros = before.match(/^0+/)?.[0].length ?? 0
    const rounded = Math.round(Number(`.${after}`))
    fraction = `${
      zeros > 0 ? before.slice(0, zeros - (rounded > 0 ? 1 : 0)) : ''
    }${
      Math.round(Number(`${before}.${after}`)) === 0
        ? ''
        : Math.round(Number(`${before}.${after}`))
    }`
    if (fraction.replace(/^0+/, '').length > decimals) {
      integer = `${BigInt(integer) + 1n}`
      fraction = fraction.slice(1)
    }
  } else {
    fraction = fraction.padEnd(decimals, '0')
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}
