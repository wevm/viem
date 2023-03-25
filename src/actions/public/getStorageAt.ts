import type { PublicClient, Transport } from '../../clients'
import type { Address, BlockTag, Chain, Hex } from '../../types'
import { numberToHex } from '../../utils'

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

export async function getStorageAt<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
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
