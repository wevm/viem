import type { TestClient } from '../../clients/index.js'
import type { Address, Hash, Hex } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetStorageAtParameters = {
  /** The account address. */
  address: Address
  /** The storage slot (index). Can either be a number or hash value. */
  index: number | Hash
  /** The value to store as a 32 byte hex string. */
  value: Hex
}

export async function setStorageAt(
  client: TestClient,
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
