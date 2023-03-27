import type { PublicClient } from '../../clients/index.js'
import type { Address, BlockTag, Hex } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type GetStorageAtParameters = {
  address: Address
  slot: Hex
} & (
  | {
      blockNumber?: never
      blockTag?: BlockTag
    }
  | {
      blockNumber?: bigint
      blockTag?: never
    }
)

export type GetStorageAtReturnType = Hex | undefined

export async function getStorageAt(
  client: PublicClient,
  { address, blockNumber, blockTag = 'latest', slot }: GetStorageAtParameters,
): Promise<GetStorageAtReturnType> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined
  const data = await client.request({
    method: 'eth_getStorageAt',
    params: [address, slot, blockNumberHex || blockTag],
  })
  return data
}
