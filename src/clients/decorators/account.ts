import {
  type WithJsonRpcAccountParameters,
  type WithJsonRpcAccountReturnType,
  withJsonRpcAccount,
} from '../../actions/wallet/withJsonRpcAccount.js'
import type { Chain } from '../../types/chain.js'
import type { Client } from '../createClient.js'
import type { Transport } from '../transports/createTransport.js'

export type AccountActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TClient extends Client<Transport, TChain> = Client<Transport, TChain>,
> = {
  /**
   * Returns a Client with an `account` property set to an address
   * returned by `eth_getAddresses` or `eth_requestAddresses`.
   *
   * @param args - Parameters
   * @returns A Client with an attached Account (`account`).
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = await createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).withJsonRpcAccount()
   */
  withJsonRpcAccount: (
    args?: WithJsonRpcAccountParameters,
  ) => Promise<WithJsonRpcAccountReturnType<TTransport, TChain, TClient>>
}

export const accountActions: <
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TClient extends Client<Transport, TChain>,
>(
  client: TChain,
) => AccountActions<TTransport, TChain, TClient> = <
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TClient extends Client<Transport, TChain>,
>(
  client: TChain,
): AccountActions<TTransport, TChain, TClient> => ({
  withJsonRpcAccount: (args) => withJsonRpcAccount(client as any, args),
})
