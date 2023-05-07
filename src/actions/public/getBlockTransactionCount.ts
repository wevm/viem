import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { Quantity } from '../../types/rpc.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'

export type GetBlockTransactionCountParameters =
  | {
      /** Hash of the block. */
      blockHash?: Hash
      blockNumber?: never
      blockTag?: never
    }
  | {
      blockHash?: never
      /** The block number. */
      blockNumber?: bigint
      blockTag?: never
    }
  | {
      blockHash?: never
      blockNumber?: never
      /** The block tag. Defaults to 'latest'. */
      blockTag?: BlockTag
    }

export type GetBlockTransactionCountReturnType = number

/**
 * Returns the number of Transactions at a block number, hash, or tag.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockTransactionCount.html
 * - JSON-RPC Methods:
 *   - Calls [`eth_getBlockTransactionCountByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber) for `blockNumber` & `blockTag`.
 *   - Calls [`eth_getBlockTransactionCountByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash) for `blockHash`.
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockTransactionCountParameters}
 * @returns The block transaction count. {@link GetBlockTransactionCountReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlockTransactionCount } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const count = await getBlockTransactionCount(client)
 */
export async function getBlockTransactionCount<
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
  }: GetBlockTransactionCountParameters = {},
): Promise<GetBlockTransactionCountReturnType> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let count: Quantity | null = null
  if (blockHash) {
    count = await client.request({
      method: 'eth_getBlockTransactionCountByHash',
      params: [blockHash],
    })
  } else {
    count = await client.request({
      method: 'eth_getBlockTransactionCountByNumber',
      params: [blockNumberHex || blockTag],
    })
  }

  return hexToNumber(count)
}
