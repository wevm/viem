import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { TransactionSerializedGeneric } from '../../types/transaction.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type SendRawTransactionParameters = {
  /** The signed serialized transaction. */
  serializedTransaction: TransactionSerializedGeneric
}

export type SendRawTransactionReturnType = Hash

export type SendRawTransactionErrorType = RequestErrorType | ErrorType

/**
 * Sends a **signed** transaction to the network
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendRawTransaction
 * - JSON-RPC Method: [`eth_sendRawTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *
 * @param client - Client to use
 * @param parameters - {@link SendRawTransactionParameters}
 * @returns The transaction hash. {@link SendRawTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendRawTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const hash = await sendRawTransaction(client, {
 *   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
 * })
 */
export async function sendRawTransaction<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  { serializedTransaction }: SendRawTransactionParameters,
): Promise<SendRawTransactionReturnType> {
  return client.request(
    {
      method: 'eth_sendRawTransaction',
      params: [serializedTransaction],
    },
    { retryCount: 0 },
  )
}
