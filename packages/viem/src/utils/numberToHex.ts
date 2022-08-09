export function numberToHex(value: number | bigint): `0x${string}` {
  return `0x${value.toString(16)}`
}
