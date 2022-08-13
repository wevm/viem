export function valueToDisplay(value: bigint, decimals: number) {
  let display = value.toString()

  const negative = display.startsWith('-')
  if (negative) display = display.slice(1)

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ]
  fraction = fraction.padStart(decimals, '0')
  fraction = fraction.replace(/(0+)$/, '')
  return `${negative ? '-' : ''}${integer || '0'}${
    fraction ? `.${fraction}` : ''
  }`
}
