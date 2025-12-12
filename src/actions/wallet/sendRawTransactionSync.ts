import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { TransactionReceiptRevertedError } from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionSerializedGeneric } from '../../types/transaction.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import {
  type FormattedTransactionReceipt,
  numberToHex,
} from '../../utils/index.js'

export type SendRawTransactionSyncParameters = {
  /** The signed serialized transaction. */
  serializedTransaction: TransactionSerializedGeneric
  /** Whether to throw an error if the transaction was detected as reverted. @default true */
  throwOnReceiptRevert?: boolean | undefined
  /** The timeout for the transaction. */
  timeout?: number | undefined
}

export type SendRawTransactionSyncReturnType<
  chain extends Chain | undefined = undefined,
> = FormattedTransactionReceipt<chain>

export type SendRawTransactionSyncErrorType = RequestErrorType | ErrorType

/**
 * Sends a **signed** transaction to the network synchronously,
 * and waits for the transaction to be included in a block.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendRawTransactionSync
 * - JSON-RPC Method: [`eth_sendRawTransactionSync`](https://eips.ethereum.org/EIPS/eip-7966)
 *
 * @param client - Client to use
 * @param parameters - {@link SendRawTransactionParameters}
 * @returns The transaction receipt. {@link SendRawTransactionSyncReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendRawTransactionSync } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const receipt = await sendRawTransactionSync(client, {
 *   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
 * })
 */
export async function sendRawTransactionSync<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    serializedTransaction,
    throwOnReceiptRevert,
    timeout,
  }: SendRawTransactionSyncParameters,
): Promise<SendRawTransactionSyncReturnType<chain>> {
  const receipt = await client.request(
    {
      method: 'eth_sendRawTransactionSync',
      params: timeout
        ? [serializedTransaction, numberToHex(timeout)]
        : [serializedTransaction],
    },
    { retryCount: 0 },
  )
  const format =
    client.chain?.formatters?.transactionReceipt?.format ||
    formatTransactionReceipt

  const formatted = format(receipt) as SendRawTransactionSyncReturnType<chain>
  if (formatted.status === 'reverted' && throwOnReceiptRevert)
    throw new TransactionReceiptRevertedError({ receipt: formatted })
  return formatted
}
