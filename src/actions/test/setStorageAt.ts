import type { Address } from 'abitype'

import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { numberToHex } from '../../utils/encoding/toHex.js'

export type SetStorageAtParameters = {
  /** The account address. */
  address: Address
  /** The storage slot (index). Can either be a number or hash value. */
  index: number | Hash
  /** The value to store as a 32 byte hex string. */
  value: Hex
}

export type SetStorageAtErrorType = RequestErrorType | ErrorType

/**
 * Writes to a slot of an account's storage.
 *
 * - Docs: https://viem.sh/docs/actions/test/setStorageAt
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
export async function setStorageAt<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain, TAccount, false>,
  { address, index, value }: SetStorageAtParameters,
) {
  await client.request({
    method: `${client.mode}_setStorageAt`,
    params: [
      address,
      typeof index === 'number' ? numberToHex(index) : index,
      value,
    ],
  })
}
