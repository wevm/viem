import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Chain } from '../../../types/chain.js'
import {
  type ConnectParameters,
  type ConnectReturnType,
  connect,
} from '../actions/connect.js'

export type Erc7846Actions = {
  /**
   * Requests to connect to a wallet.
   *
   * - Docs: https://viem.sh/experimental/erc7846/connect
   * - JSON-RPC Methods: [`wallet_connect`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md)
   *
   * @param client - Client to use
   * @param parameters - {@link ConnectParameters}
   * @returns List of accounts managed by a wallet {@link ConnectReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc7846Actions } from 'viem/experimental/erc7846'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(erc7846Actions())
   *
   * const response = await client.connect()
   */
  connect: (
    parameters?: ConnectParameters | undefined,
  ) => Promise<ConnectReturnType>
}

/**
 * A suite of ERC-7846 Wallet Actions.
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc7846Actions } from 'viem/experimental/erc7846'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(erc7846Actions())
 *
 * const response = await client.connect()
 */
export function erc7846Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
  >(
    client: Client<transport, chain>,
  ): Erc7846Actions => {
    return {
      connect: (parameters) => connect(client, parameters),
    }
  }
}
