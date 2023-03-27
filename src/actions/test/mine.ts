import type { TestClient } from '../../clients/index.js'
import { numberToHex } from '../../utils/index.js'

export type MineParameters = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

export async function mine(
  client: TestClient,
  { blocks, interval }: MineParameters,
) {
  return await client.request({
    method: `${client.mode}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
