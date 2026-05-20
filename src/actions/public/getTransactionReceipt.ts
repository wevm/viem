import type * as Hex from 'ox/Hex'
import * as TransactionReceipt from 'ox/TransactionReceipt'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/BaseError.js'

/**
 * Returns the receipt for a given transaction hash.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const receipt = await actions.getTransactionReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Transaction receipt.
 */
export async function getTransactionReceipt<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getTransactionReceipt.Options,
): getTransactionReceipt.ReturnType {
  const { hash } = options
  const receipt = await client.request(
    { method: 'eth_getTransactionReceipt', params: [hash] },
    { dedupe: true },
  )
  if (!receipt) throw new TransactionReceiptNotFoundError({ hash })
  return TransactionReceipt.fromRpc(receipt)!
}

export declare namespace getTransactionReceipt {
  type Options = {
    /** Transaction hash. */
    hash: Hex.Hex
  }

  type ReturnType = Promise<TransactionReceipt.TransactionReceipt>

  type ErrorType = TransactionReceiptNotFoundError
}

export class TransactionReceiptNotFoundError extends BaseError {
  override name = 'actions.public.TransactionReceiptNotFoundError'

  constructor(options: TransactionReceiptNotFoundError.Options) {
    super(
      `Transaction receipt with hash "${options.hash}" could not be found. The Transaction may not be processed on a block yet.`,
    )
  }
}

export declare namespace TransactionReceiptNotFoundError {
  type Options = {
    hash: Hex.Hex
  }
}
