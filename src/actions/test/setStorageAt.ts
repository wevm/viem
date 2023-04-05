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
