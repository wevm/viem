import { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type MineArgs = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

export async function mine(rpc: TestClient, { blocks, interval }: MineArgs) {
  return await rpc.request({
    method: `${rpc.key}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
