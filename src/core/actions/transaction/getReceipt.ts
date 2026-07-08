import { TransactionReceipt } from 'ox'
import type { Errors, Hex } from 'ox'
import { z } from 'ox/zod'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'

/**
 * Returns the transaction receipt for a given transaction hash.
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
 * const receipt = await Actions.transaction.getReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function getReceipt<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getReceipt.Options,
): Promise<getReceipt.ReturnType<chain>> {
  const { hash } = options

  const receipt = await client.request(
    { method: 'eth_getTransactionReceipt', params: [hash] },
    { dedupe: true },
  )

  if (!receipt) throw new TransactionReceiptNotFoundError({ hash })

  const schema = client.chain?.schema?.transactionReceipt?.fromRpc
  return (
    schema ? z.decode(schema, receipt) : TransactionReceipt.fromRpc(receipt)
  ) as getReceipt.ReturnType<chain>
}

export declare namespace getReceipt {
  type Options = {
    /** Hash of the transaction. */
    hash: Hex.Hex
  }

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    Chain.ExtractTransactionReceipt<chain>

  type ErrorType = TransactionReceiptNotFoundError | Errors.GlobalErrorType
}

/** Thrown when a transaction receipt could not be found. */
export class TransactionReceiptNotFoundError extends BaseError {
  override readonly name = 'TransactionReceipt.NotFoundError'

  constructor({ hash }: { hash: Hex.Hex }) {
    super(
      `Transaction receipt with hash "${hash}" could not be found. The Transaction may not be processed on a block yet.`,
    )
  }
}
