import { Address } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Returns a list of account addresses owned by the wallet or client.
 *
 * - Local Accounts: returns the hoisted account address (no JSON-RPC request).
 * - JSON-RPC Accounts: returns the wallet's accounts via `eth_accounts`.
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
 * const addresses = await Actions.wallet.getAddresses(client)
 * ```
 */
export async function getAddresses(
  client: Client.Client,
): Promise<getAddresses.ReturnType> {
  if (client.account?.type === 'local') return [client.account.address]
  const addresses = await client.request(
    { method: 'eth_accounts' },
    { dedupe: true },
  )
  return addresses.map((address) => Address.checksum(address))
}

export declare namespace getAddresses {
  type ReturnType = readonly Address.Address[]

  type ErrorType = Address.checksum.ErrorType | Errors.GlobalErrorType
}
