export function hexToNumber(value: `0x${string}`): number {
  return Number(BigInt(value))
}
