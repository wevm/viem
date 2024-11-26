import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type PrepareAuthorizationParameters,
  type PrepareAuthorizationReturnType,
  prepareAuthorization,
} from '../actions/prepareAuthorization.js'
import {
  type SignAuthorizationParameters,
  type SignAuthorizationReturnType,
  signAuthorization,
} from '../actions/signAuthorization.js'

export type Eip7702Actions<
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Prepares an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object for signing.
   * This Action will fill the required fields of the Authorization object if they are not provided (e.g. `nonce` and `chainId`).
   *
   * With the prepared Authorization object, you can use [`signAuthorization`](https://viem.sh/experimental/eip7702/signAuthorization) to sign over the Authorization object.
   *
   * @param client - Client to use
   * @param parameters - {@link PrepareAuthorizationParameters}
   * @returns The prepared Authorization object. {@link PrepareAuthorizationReturnType}
   *
   * @example
   * import { createClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { eip7702Actions } from 'viem/experimental'
   *
   * const client = createClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(eip7702Actions())
   *
   * const authorization = await client.prepareAuthorization({
   *   account: privateKeyToAccount('0x..'),
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { eip7702Actions } from 'viem/experimental'
   *
   * const client = createClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(eip7702Actions())
   *
   * const authorization = await client.prepareAuthorization({
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  prepareAuthorization: (
    parameters: PrepareAuthorizationParameters<account>,
  ) => Promise<PrepareAuthorizationReturnType>
  /**
   * Signs an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object.
   *
   * With the calculated signature, you can:
   * - use [`verifyAuthorization`](https://viem.sh/experimental/eip7702/verifyAuthorization) to verify the signed Authorization object,
   * - use [`recoverAuthorizationAddress`](https://viem.sh/experimental/eip7702/recoverAuthorizationAddress) to recover the signing address from the signed Authorization object.
   *
   * @param client - Client to use
   * @param parameters - {@link SignAuthorizationParameters}
   * @returns The signed Authorization object. {@link SignAuthorizationReturnType}
   *
   * @example
   * import { createClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { eip7702Actions } from 'viem/experimental'
   *
   * const client = createClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(eip7702Actions())
   *
   * const signature = await client.signAuthorization({
   *   account: privateKeyToAccount('0x..'),
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { eip7702Actions } from 'viem/experimental'
   *
   * const client = createClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(eip7702Actions())
   *
   * const signature = await client.signAuthorization({
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  signAuthorization: (
    parameters: SignAuthorizationParameters<account>,
  ) => Promise<SignAuthorizationReturnType>
}

/**
 * A suite of EIP-7702 Actions.
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { eip7702Actions } from 'viem/experimental'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(eip7702Actions())
 *
 * const hash = await client.signAuthorization({ ... })
 */
export function eip7702Actions() {
  return <account extends Account | undefined = Account | undefined>(
    client: Client<Transport, Chain | undefined, account>,
  ): Eip7702Actions<account> => {
    return {
      prepareAuthorization: (parameters) =>
        prepareAuthorization(client, parameters),
      signAuthorization: (parameters) => signAuthorization(client, parameters),
    }
  }
}
