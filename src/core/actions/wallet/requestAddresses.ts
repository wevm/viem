import { Address } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Requests a list of accounts managed by a wallet.
 *
 * Sends a request to the wallet asking for permission to access the user's
 * accounts via `eth_requestAccounts`. After the user accepts, it returns a list
 * of account addresses.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const addresses = await Actions.wallet.requestAddresses(client)
 * ```
 */
export async function requestAddresses(
  client: Client.Client,
): Promise<requestAddresses.ReturnType> {
  const addresses = await client.request(
    { method: 'eth_requestAccounts' },
    { dedupe: true, retryCount: 0 },
  )
  return addresses.map((address) => Address.checksum(address))
}

export declare namespace requestAddresses {
  type ReturnType = readonly Address.Address[]

  type ErrorType = Address.checksum.ErrorType | Errors.GlobalErrorType
}
