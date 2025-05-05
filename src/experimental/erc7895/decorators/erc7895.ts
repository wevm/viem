import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Chain } from '../../../types/chain.js'
import {
  type AddSubAccountParameters,
  type AddSubAccountReturnType,
  addSubAccount,
} from '../actions/addSubAccount.js'

export type Erc7895Actions = {
  /**
   * Requests to add a Sub Account.
   *
   * - Docs: https://viem.sh/experimental/erc7895/addSubAccount
   * - JSON-RPC Methods: [`wallet_addSubAccount`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7895.md)
   *
   * @param client - Client to use
   * @param parameters - {@link AddSubAccountParameters}
   * @returns Sub Account. {@link AddSubAccountReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc7895Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(erc7895Actions())
   *
   * const response = await client.addSubAccount({
   *   keys: [{ key: '0x0000000000000000000000000000000000000000', type: 'address' }],
   *   type: 'create',
   * })
   */
  addSubAccount: (
    parameters: AddSubAccountParameters,
  ) => Promise<AddSubAccountReturnType>
}

/**
 * A suite of ERC-7895 Wallet Actions.
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc7895Actions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(erc7895Actions())
 *
 * const response = await client.addSubAccount({
 *   keys: [{ key: '0x0000000000000000000000000000000000000000', type: 'address' }],
 *   type: 'create',
 * })
 */
export function erc7895Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
  >(
    client: Client<transport, chain>,
  ): Erc7895Actions => {
    return {
      addSubAccount: (parameters) => addSubAccount(client, parameters),
    }
  }
}
