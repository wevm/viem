import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import { parseAccount } from '../../utils/accounts.js'
import { getAddresses } from './getAddresses.js'
import { requestAddresses } from './requestAddresses.js'

export type WithJsonRpcAccountParameters = {
  method?: 'get' | 'request'
  index?: number
}
export type WithJsonRpcAccountReturnType<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TClient extends Client<TTransport, TChain>,
> = Omit<TClient, 'account'> & {
  account: Account
}

/**
 * Returns a Client with an `account` property set to an address
 * returned by `eth_accounts` or `eth_requestAccounts`.
 *
 * @param client - Client to use
 * @returns A Client with an attached Account (`account`).
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * let client = await createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * client = await withJsonRpcAccount(client)
 */
export async function withJsonRpcAccount<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TClient extends Client<TTransport, TChain>,
>(
  client: TClient,
  args: WithJsonRpcAccountParameters = {},
): Promise<Omit<TClient, 'account'> & { account: Account }> {
  const { method = 'get', index = 0 } = args
  const actions = {
    get: getAddresses,
    request: requestAddresses,
  }
  const addresses = await actions[method](client)
  return Object.assign(client, {
    account: parseAccount(addresses[index]),
  }) as TClient & { account: Account }
}
