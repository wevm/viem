import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type GetAssetsParameters,
  type GetAssetsReturnType,
  getAssets,
} from '../actions/getAssets.js'

export type Erc7811Actions<
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Requests to get assets for an account from a wallet.
   *
   * - Docs: https://viem.sh/experimental/erc7811/getAssets
   *
   * @param client - Client to use
   * @param parameters - {@link GetAssetsParameters}
   * @returns List of assets for the given account {@link GetAssetsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc7811Actions } from 'viem/experimental/erc7811'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(erc7811Actions())
   *
   * const response = await client.getAssets({
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   * })
   */
  getAssets: <
    aggregate extends
      | boolean
      | ((asset: getAssets.Asset) => string)
      | undefined = undefined,
  >(
    ...[parameters]: account extends Account
      ? [GetAssetsParameters<aggregate, account>] | []
      : [GetAssetsParameters<aggregate, account>]
  ) => Promise<GetAssetsReturnType<aggregate>>
}

/**
 * A suite of ERC-7811 Wallet Actions.
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc7811Actions } from 'viem/experimental/erc7811'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(erc7811Actions())
 *
 * const response = await client.getAssets({
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 * })
 */
export function erc7811Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Erc7811Actions<account> => {
    return {
      // @ts-expect-error
      getAssets: (...[parameters]) => getAssets(client, parameters),
    }
  }
}
