import type { Address } from '../../accounts/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  TransactionNotFoundError,
  type TransactionNotFoundErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type { OneOf, Prettify } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type FormattedTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'

export type GetTransactionParameters<blockTag extends BlockTag = 'latest'> =
  OneOf<
    // eth_getTransactionByBlockHashAndIndex
    | {
        /** The block hash */
        blockHash: Hash
        /** The index of the transaction on the block. */
        index: number
      }
    // eth_getTransactionByBlockNumberAndIndex
    | {
        /** The block number */
        blockNumber: bigint
        /** The index of the transaction on the block. */
        index: number
      }
    // eth_getTransactionByBlockNumberAndIndex
    | {
        /** The block tag. */
        blockTag: blockTag | BlockTag
        /** The index of the transaction on the block. */
        index: number
      }
    // eth_getTransactionByHash
    | {
        /** The hash of the transaction. */
        hash: Hash
      }
    // eth_getTransactionBySenderAndNonce
    | {
        /** The sender of the transaction. */
        sender: Address
        /** The nonce of the transaction on the sender. */
        nonce: number
      }
  >

export type GetTransactionReturnType<
  chain extends Chain | undefined = undefined,
  blockTag extends BlockTag = 'latest',
> = Prettify<FormattedTransaction<chain, blockTag>>

export type GetTransactionErrorType =
  | TransactionNotFoundErrorType
  | NumberToHexErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns information about a [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash or block identifier.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransaction
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions
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
export async function getTransaction<
  chain extends Chain | undefined,
  blockTag extends BlockTag = 'latest',
>(
  client: Client<Transport, chain>,
  {
    blockHash,
    blockNumber,
    blockTag: blockTag_,
    hash,
    index,
    sender,
    nonce,
  }: GetTransactionParameters<blockTag>,
): Promise<GetTransactionReturnType<chain, blockTag>> {
  const blockTag = blockTag_ || 'latest'

  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let transaction: RpcTransaction | null = null
  if (hash) {
    transaction = await client.request(
      {
        method: 'eth_getTransactionByHash',
        params: [hash],
      },
      { dedupe: true },
    )
  } else if (blockHash) {
    transaction = await client.request(
      {
        method: 'eth_getTransactionByBlockHashAndIndex',
        params: [blockHash, numberToHex(index)],
      },
      { dedupe: true },
    )
  } else if ((blockNumberHex || blockTag) && typeof index === 'number') {
    transaction = await client.request(
      {
        method: 'eth_getTransactionByBlockNumberAndIndex',
        params: [blockNumberHex || blockTag, numberToHex(index)],
      },
      { dedupe: Boolean(blockNumberHex) },
    )
  } else if (sender && typeof nonce === 'number') {
    transaction = await client.request(
      {
        method: 'eth_getTransactionBySenderAndNonce',
        params: [sender, numberToHex(nonce)],
      },
      { dedupe: true },
    )
  }

  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash,
      index,
    })

  const format =
    client.chain?.formatters?.transaction?.format || formatTransaction
  return format(transaction, 'getTransaction')
}
