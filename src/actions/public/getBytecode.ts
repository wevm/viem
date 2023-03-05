import { PublicClient } from '../../clients'
import { Address, BlockTag, Hex } from '../../types'
import { numberToHex } from '../../utils'

export type GetBytecodeParameters = {
  address: Address
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

export type GetBytecodeReturnType = Hex | undefined

export async function getBytecode(
  client: PublicClient,
  { address, blockNumber, blockTag = 'latest' }: GetBytecodeParameters,
): Promise<GetBytecodeReturnType> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined
  const hex = await client.request({
    method: 'eth_getCode',
    params: [address, blockNumberHex || blockTag],
  })
  if (hex === '0x') return undefined
  return hex
}
