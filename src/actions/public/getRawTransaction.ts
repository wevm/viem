import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  TransactionNotFoundError,
  type TransactionNotFoundErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type GetRawTransactionParameters = {
  /** The hash of the transaction. */
  hash: Hash
}

export type GetRawTransactionReturnType = Hex

export type GetRawTransactionErrorType =
  | TransactionNotFoundErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns the raw, serialized [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash.
 *
 * - Docs: https://viem.sh/docs/actions/public/getRawTransaction
 * - JSON-RPC Methods: `eth_getRawTransactionByHash`
 *
 * @param client - Client to use
 * @param parameters - {@link GetRawTransactionParameters}
 * @returns The raw, serialized transaction. {@link GetRawTransactionReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getRawTransaction } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const rawTransaction = await getRawTransaction(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export async function getRawTransaction<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  { hash }: GetRawTransactionParameters,
): Promise<GetRawTransactionReturnType> {
  const rawTransaction = await client.request(
    {
      method: 'eth_getRawTransactionByHash',
      params: [hash],
    },
    { dedupe: true },
  )
  if (!rawTransaction) throw new TransactionNotFoundError({ hash })
  return rawTransaction
}
