import type { TestClient } from '../../clients'
import type { Address, Data } from '../../types'
import { numberToHex } from '../../utils'

export type SetStorageAtArgs = {
  /** The account address. */
  address: Address
  /** The storage slot (index). */
  index: number | Data
  /** The value to store as a 32 byte hex string. */
  value: Data
}

export async function setStorageAt(
  client: TestClient,
  { address, index, value }: SetStorageAtArgs,
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
