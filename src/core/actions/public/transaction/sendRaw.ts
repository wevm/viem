import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as TxEnvelope from 'ox/TxEnvelope'

import type * as Client from '../../../Client.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Sends a **signed** transaction to the network (`eth_sendRawTransaction`).
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
 * const hash = await Actions.transaction.sendRaw(client, {
 *   transaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33',
 * })
 * ```
 */
export async function sendRaw(
  client: Client.Client,
  options: sendRaw.Options,
): Promise<sendRaw.ReturnType> {
  const { requestOptions, transaction } = options
  return client.request(
    { method: 'eth_sendRawTransaction', params: [transaction] },
    { ...requestOptions, retryCount: 0 },
  )
}

export declare namespace sendRaw {
  type Options = {
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
    /** The signed serialized transaction. */
    transaction: TxEnvelope.Serialized | Hex.Hex
  }

  type ReturnType = Hex.Hex

  type ErrorType = Errors.GlobalErrorType
}
