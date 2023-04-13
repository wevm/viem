import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain, Hash, Hex } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetStorageAtParameters = {
  /** The account address. */
  address: Address
  /** The storage slot (index). Can either be a number or hash value. */
  index: number | Hash
  /** The value to store as a 32 byte hex string. */
  value: Hex
}

/**
 * Writes to a slot of an account's storage.
 *
 * - Docs: https://viem.sh/docs/actions/test/setStorageAt.html
 *
 * @param client - Client to use
 * @param parameters – {@link SetStorageAtParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setStorageAt } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setStorageAt(client, {
 *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
 *   index: 2,
 *   value: '0x0000000000000000000000000000000000000000000000000000000000000069',
 * })
 */
export async function setStorageAt<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address, index, value }: SetStorageAtParameters,
) {
  return await client.request({
    method: `${client.mode}_setStorageAt`,
    params: [
      address,
      typeof index === 'number' ? numberToHex(index) : index,
      value,
    ],
  })
}
