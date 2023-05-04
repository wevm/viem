import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import { numberToHex } from '../../utils/encoding/toHex.js'

export type MineParameters = {
  /** Number of blocks to mine. */
  blocks: number
  /** Interval between each block in seconds. */
  interval?: number
}

/**
 * Mine a specified number of blocks.
 *
 * - Docs: https://viem.sh/docs/actions/test/mine.html
 *
 * @param client - Client to use
 * @param parameters – {@link MineParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { mine } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await mine(client, { blocks: 1 })
 */
export async function mine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { blocks, interval }: MineParameters,
) {
  await client.request({
    method: `${client.mode}_mine`,
    params: [numberToHex(blocks), numberToHex(interval || 0)],
  })
}
