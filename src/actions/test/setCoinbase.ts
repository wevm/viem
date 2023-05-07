import type { Address } from 'abitype'

import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'

export type SetCoinbaseParameters = {
  /** The coinbase address. */
  address: Address
}

/**
 * Sets the coinbase address to be used in new blocks.
 *
 * - Docs: https://viem.sh/docs/actions/test/setCoinbase.html
 *
 * @param client - Client to use
 * @param parameters – {@link SetCoinbaseParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setCoinbase } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setCoinbase(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 * })
 */
export async function setCoinbase<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address }: SetCoinbaseParameters,
) {
  await client.request({
    method: `${client.mode}_setCoinbase`,
    params: [address],
  })
}
