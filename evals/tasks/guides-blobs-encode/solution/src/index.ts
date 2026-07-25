import { Blobs, Hex } from 'viem/utils'

export function example() {
  const value = 'y'.repeat(31 * 4096 + 1_000)
  const blobs = Blobs.from(Hex.fromString(value))
  return { blobs, value: Hex.toString(Blobs.to(blobs)) }
}
