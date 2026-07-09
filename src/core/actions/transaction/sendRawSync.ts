import { TransactionReceipt as TransactionReceipt_ } from 'ox'
import type {
  Errors,
  Hex,
  TransactionEnvelope as TxEnvelope,
  TransactionReceipt,
} from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Sends a **signed** transaction to the network synchronously
 * (`eth_sendRawTransactionSync`), returning its receipt.
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
 * const receipt = await Actions.transaction.sendRawSync(client, {
 *   transaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33',
 * })
 * ```
 */
export async function sendRawSync<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: sendRawSync.Options,
): Promise<sendRawSync.ReturnType<chain>> {
  const { requestOptions, throwOnReceiptRevert, timeout, transaction } = options

  const receipt = (await client.request(
    {
      method: 'eth_sendRawTransactionSync',
      params: timeout ? [transaction, timeout] : [transaction],
    },
    { ...requestOptions, retryCount: 0 },
  )) as TransactionReceipt.Rpc

  const fromRpc = client.chain?.schema?.transactionReceipt?.fromRpc
  const decoded = (
    fromRpc ? fromRpc(receipt) : TransactionReceipt_.fromRpc(receipt)
  ) as sendRawSync.ReturnType<chain>

  if (decoded.status === 'reverted' && throwOnReceiptRevert)
    throw new TransactionReceiptRevertedError({ receipt: decoded })

  return decoded
}

export declare namespace sendRawSync {
  type Options = {
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
    /** Whether to throw if the transaction receipt status is `reverted`. */
    throwOnReceiptRevert?: boolean | undefined
    /** Timeout in ms for the sync RPC response. */
    timeout?: number | undefined
    /** The signed serialized transaction. */
    transaction: TxEnvelope.Serialized | Hex.Hex
  }

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    Chain.ExtractTransactionReceipt<chain>

  type ErrorType = TransactionReceiptRevertedError | Errors.GlobalErrorType
}

/** Thrown when a sync transaction receipt reports a reverted transaction. */
export class TransactionReceiptRevertedError extends BaseError {
  override readonly name = 'TransactionReceipt.RevertedError'

  constructor({ receipt }: { receipt: { transactionHash: Hex.Hex } }) {
    super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
      metaMessages: [
        'The receipt marked the transaction as "reverted". This could mean that the contract function threw an error.',
      ],
    })
  }
}
