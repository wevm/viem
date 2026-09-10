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

  // EIP-8130 (`AA_TX_TYPE`, type 0x79) responses wrap the transaction body in a
  // nested `tx` object and omit the `hash` field (unlike standard tx responses).
  // Flatten the nested body and inject the request hash so downstream formatters
  // (and `waitForTransactionReceipt`) have all the fields they expect.
  if ((transaction as any).type === '0x79') {
    const raw = transaction as any
    const body = raw.tx ?? {}
    transaction = {
      // Inject the request hash — not present in the RPC response.
      hash: hash ?? undefined,
      type: '0x79',
      // Top-level block context fields (present in mined txs).
      blockHash: raw.blockHash,
      blockNumber: raw.blockNumber,
      blockTimestamp: raw.blockTimestamp,
      transactionIndex: raw.transactionIndex,
      gasPrice: raw.gasPrice,
      // Tx body fields mapped to standard hex form.
      from: raw.from ?? body.sender,
      chainId: body.chainId != null ? numberToHex(body.chainId) : undefined,
      gas: body.gasLimit != null ? numberToHex(body.gasLimit) : undefined,
      maxFeePerGas: body.maxFeePerGas,
      maxPriorityFeePerGas: body.maxPriorityFeePerGas,
      // Map 2D nonce: use nonceSequence as the canonical nonce for compat.
      nonce: body.nonceSequence != null ? numberToHex(body.nonceSequence) : undefined,
      // EIP-8130 txs have no single `to` — calls are a structured list.
      to: null,
      value: '0x0',
      input: '0x',
      // EIP-8130 extra fields (preserved as-is for the eip8130 `getTransaction`).
      nonceKey: body.nonceKey,
      expiry: body.expiry,
      calls: body.calls,
      accountChanges: body.accountChanges,
      metadata: body.metadata,
      payer: body.payer ?? null,
      senderAuth: raw.senderAuth,
      payerAuth: raw.payerAuth,
    } as unknown as RpcTransaction
  }

  const format =
    client.chain?.formatters?.transaction?.format || formatTransaction
  return format(transaction, 'getTransaction')
}
