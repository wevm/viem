import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type MineArgs = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

export async function mine(client: TestClient, { blocks, interval }: MineArgs) {
  return await client.request({
    method: `${client.mode}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
