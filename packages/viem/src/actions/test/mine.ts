import { TestProvider } from '../../providers/test/createTestProvider'
import { numberToHex } from '../../utils'

export type MineArgs = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

export async function mine(
  provider: TestProvider,
  { blocks, interval }: MineArgs,
) {
  return await provider.request({
    method: `${provider.id}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
