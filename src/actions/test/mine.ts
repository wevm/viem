import type { TestClientArg } from '../../clients'
import { numberToHex } from '../../utils'

export type MineParameters = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

export async function mine(
  client: TestClientArg,
  { blocks, interval }: MineParameters,
) {
  return await client.request({
    method: `${client.mode}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
