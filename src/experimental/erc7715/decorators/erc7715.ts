import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { type GetSupportedExecutionPermissionsReturnType, getSupportedExecutionPermissions } from '../actions/getSupportedExecutionPermissions.js'
import {
  type RequestExecutionPermissionsParameters,
  type RequestExecutionPermissionsReturnType,
  requestExecutionPermissions,
} from '../actions/requestExecutionPermissions.js'

export type Erc7715Actions = {
  /**
   * Request permissions from a wallet to perform actions on behalf of a user.
   *
   * - Docs: https://viem.sh/experimental/erc7715/requestExecutionPermissions
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc7715Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(erc7715Actions())
   *
   * const result = await client.requestExecutionPermissions({
   *   chainId: 1,
   *   to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
   *   permission: {
   *     type: "native-token-allowance",
   *     isAdjustmentAllowed: false,
   *     data: {
   *       allowance: "0x1DCD6500",
   *     },
   *   },
   * })
   */
  requestExecutionPermissions: (
    parameters: RequestExecutionPermissionsParameters,
  ) => Promise<RequestExecutionPermissionsReturnType>

  /**
   * Get the supported execution permissions for a wallet.
   *
   * - Docs: https://viem.sh/experimental/erc7715/getSupportedExecutionPermissions
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc7715Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(erc7715Actions())
   *
   * const result = await client.getSupportedExecutionPermissions()
   */
  getSupportedExecutionPermissions: () => Promise<GetSupportedExecutionPermissionsReturnType>
}

/**
 * A suite of ERC-7715 Wallet Actions.
 *
 * - Docs: https://viem.sh/experimental
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc7715Actions } from 'viem/experimental'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(erc7715Actions())
 *
 * const result = await walletClient.requestExecutionPermissions({...})
 */
export function erc7715Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Erc7715Actions => {
    return {
      requestExecutionPermissions: (parameters) =>
        requestExecutionPermissions(client, parameters),
      getSupportedExecutionPermissions: () =>
        getSupportedExecutionPermissions(client),
    }
  }
}
