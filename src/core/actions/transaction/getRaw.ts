import type { Errors, Hex } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { TransactionNotFoundError } from './get.js'

/**
 * Returns the raw, serialized transaction given a hash.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const rawTransaction = await Actions.transaction.getRaw(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function getRaw<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getRaw.Options,
): Promise<getRaw.ReturnType> {
  const { hash } = options
  const rawTransaction = (await client.request(
    { method: 'eth_getRawTransactionByHash', params: [hash] },
    { dedupe: true },
  )) as Hex.Hex | null
  if (!rawTransaction) throw new TransactionNotFoundError({ hash })
  return rawTransaction
}

export declare namespace getRaw {
  type Options = {
    /** Hash of the transaction. */
    hash: Hex.Hex
  }

  type ReturnType = Hex.Hex

  type ErrorType = TransactionNotFoundError | Errors.GlobalErrorType
}
