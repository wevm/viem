import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestOptions } from '../../types/eip1193.js'
import type { Hash } from '../../types/misc.js'
import type { Quantity } from '../../types/rpc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type HexToNumberErrorType,
  hexToNumber,
} from '../../utils/encoding/fromHex.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type GetBlockTransactionCountParameters = {
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
} & (
  | {
      /** Hash of the block. */
      blockHash?: Hash | undefined
      blockNumber?: undefined
      blockTag?: undefined
    }
  | {
      blockHash?: undefined
      /** The block number. */
      blockNumber?: bigint | undefined
      blockTag?: undefined
    }
  | {
      blockHash?: undefined
      blockNumber?: undefined
      /** The block tag. Defaults to 'latest'. */
      blockTag?: BlockTag | undefined
    }
)

export type GetBlockTransactionCountReturnType = number

export type GetBlockTransactionCountErrorType =
  | NumberToHexErrorType
  | HexToNumberErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns the number of Transactions at a block number, hash, or tag.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockTransactionCount
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
export async function getBlockTransactionCount<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    requestOptions,
  }: GetBlockTransactionCountParameters = {},
): Promise<GetBlockTransactionCountReturnType> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let count: Quantity
  if (blockHash) {
    count = await client.request(
      {
        method: 'eth_getBlockTransactionCountByHash',
        params: [blockHash],
      },
      { dedupe: true, ...requestOptions },
    )
  } else {
    count = await client.request(
      {
        method: 'eth_getBlockTransactionCountByNumber',
        params: [blockNumberHex || blockTag],
      },
      { dedupe: Boolean(blockNumberHex), ...requestOptions },
    )
  }

  return hexToNumber(count)
}
