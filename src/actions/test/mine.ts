import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'
import { numberToHex } from '../../utils'

export type MineParameters = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

export async function mine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  { blocks, interval }: MineParameters,
) {
  return await client.request({
    method: `${client.mode}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
