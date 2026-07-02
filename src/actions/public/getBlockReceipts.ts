import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  BlockNotFoundError,
  type BlockNotFoundErrorType,
} from '../../errors/block.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type FormattedTransactionReceipt,
  formatTransactionReceipt,
} from '../../utils/formatters/transactionReceipt.js'

export type GetBlockReceiptsParameters =
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

export type GetBlockReceiptsReturnType<
  chain extends Chain | undefined = undefined,
> = FormattedTransactionReceipt<chain>[]

export type GetBlockReceiptsErrorType =
  | BlockNotFoundErrorType
  | NumberToHexErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns the transaction receipts of a block at a block number, hash, or tag.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockReceipts
 * - JSON-RPC Methods: [`eth_getBlockReceipts`](https://ethereum.github.io/execution-apis/api/methods/eth_getBlockReceipts/)
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockReceiptsParameters}
 * @returns The transaction receipts. {@link GetBlockReceiptsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlockReceipts } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const receipts = await getBlockReceipts(client, {
 *   blockNumber: 69420n,
 * })
 */
export async function getBlockReceipts<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    blockHash,
    blockNumber,
    blockTag = client.experimental_blockTag ?? 'latest',
  }: GetBlockReceiptsParameters = {},
): Promise<GetBlockReceiptsReturnType<chain>> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  const receipts = await client.request(
    {
      method: 'eth_getBlockReceipts',
      params: [blockHash || blockNumberHex || blockTag],
    },
    { dedupe: Boolean(blockHash || blockNumberHex) },
  )

  if (!receipts) throw new BlockNotFoundError({ blockHash, blockNumber })

  const format =
    client.chain?.formatters?.transactionReceipt?.format ||
    formatTransactionReceipt
  return receipts.map((receipt) =>
    format(receipt, 'getBlockReceipts'),
  ) as GetBlockReceiptsReturnType<chain>
}
