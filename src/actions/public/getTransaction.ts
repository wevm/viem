import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { TransactionNotFoundError } from '../../errors/transaction.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { format } from '../../utils/formatters/format.js'
import {
  type FormattedTransaction,
  type TransactionFormatter,
  formatTransaction,
} from '../../utils/formatters/transaction.js'

export type GetTransactionParameters =
  | {
      /** The block hash */
      blockHash: Hash
      blockNumber?: never
      blockTag?: never
      hash?: never
      /** The index of the transaction on the block. */
      index: number
    }
  | {
      blockHash?: never
      /** The block number */
      blockNumber: bigint
      blockTag?: never
      hash?: never
      /** The index of the transaction on the block. */
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      /** The block tag. */
      blockTag: BlockTag
      hash?: never
      /** The index of the transaction on the block. */
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTag?: never
      /** The hash of the transaction. */
      hash: Hash
      index?: number
    }

export type GetTransactionReturnType<TChain extends Chain | undefined = Chain> =
  FormattedTransaction<TransactionFormatter<TChain>>

/**
 * Returns information about a [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash or block identifier.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransaction.html
 * - Example: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/fetching-transactions
 * - JSON-RPC Methods: [`eth_getTransactionByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionByHash)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionParameters}
 * @returns The transaction information. {@link GetTransactionReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransaction } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transaction = await getTransaction(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export async function getTransaction<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    hash,
    index,
  }: GetTransactionParameters,
): Promise<GetTransactionReturnType<TChain>> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let transaction: RpcTransaction | null = null
  if (hash) {
    transaction = await client.request({
      method: 'eth_getTransactionByHash',
      params: [hash],
    })
  } else if (blockHash) {
    transaction = await client.request({
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [blockHash, numberToHex(index)],
    })
  } else if (blockNumberHex || blockTag) {
    transaction = await client.request({
      method: 'eth_getTransactionByBlockNumberAndIndex',
      params: [blockNumberHex || blockTag, numberToHex(index)],
    })
  }

  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash,
      index,
    })

  return format(transaction, {
    formatter: client.chain?.formatters?.transaction || formatTransaction,
  })
}
