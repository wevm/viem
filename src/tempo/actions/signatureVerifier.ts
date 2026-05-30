import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Verifies that a keychain signature was produced by an active access key
 * for the expected account. Returns `false` for account mismatches, unknown,
 * revoked, or expired access keys. [TIP-1049](https://tips.sh/1049)
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const valid = await Actions.signatureVerifier.verifyKeychain(client, {
 *   account: '0x...',
 *   hash: '0x...',
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the keychain signature is valid for the account.
 */
export async function verifyKeychain<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: verifyKeychain.Parameters,
): Promise<verifyKeychain.ReturnValue> {
  const { account, hash, signature, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...verifyKeychain.call({ account, hash, signature }),
  })
}

export namespace verifyKeychain {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Account address the signature is expected to belong to. */
    account: Address
    /** Original message hash that was signed. */
    hash: Hex
    /** Keychain signature envelope (V2). */
    signature: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.signatureVerifier,
    'verifyKeychain',
    never
  >

  /**
   * Defines a call to the `verifyKeychain` function.
   *
   * Can be passed as a parameter to:
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [
   *     Actions.signatureVerifier.verifyKeychain.call({
   *       account: '0x...',
   *       hash: '0x...',
   *       signature: '0x...',
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, hash, signature } = args
    return defineCall({
      address: Addresses.signatureVerifier,
      abi: Abis.signatureVerifier,
      functionName: 'verifyKeychain',
      args: [account, hash, signature],
    })
  }
}

/**
 * Verifies that a keychain signature was produced by the account's root key
 * or an active admin access key. Returns `false` for account mismatches,
 * non-admin, unknown, revoked, or expired access keys.
 * [TIP-1049](https://tips.sh/1049)
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const valid = await Actions.signatureVerifier.verifyKeychainAdmin(client, {
 *   account: '0x...',
 *   hash: '0x...',
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the keychain signature was produced by the account's
 *   root key or an admin access key.
 */
export async function verifyKeychainAdmin<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: verifyKeychainAdmin.Parameters,
): Promise<verifyKeychainAdmin.ReturnValue> {
  const { account, hash, signature, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...verifyKeychainAdmin.call({ account, hash, signature }),
  })
}

export namespace verifyKeychainAdmin {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Account address the signature is expected to belong to. */
    account: Address
    /** Original message hash that was signed. */
    hash: Hex
    /** Keychain signature envelope (V2). */
    signature: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.signatureVerifier,
    'verifyKeychainAdmin',
    never
  >

  /**
   * Defines a call to the `verifyKeychainAdmin` function.
   *
   * Can be passed as a parameter to:
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [
   *     Actions.signatureVerifier.verifyKeychainAdmin.call({
   *       account: '0x...',
   *       hash: '0x...',
   *       signature: '0x...',
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, hash, signature } = args
    return defineCall({
      address: Addresses.signatureVerifier,
      abi: Abis.signatureVerifier,
      functionName: 'verifyKeychainAdmin',
      args: [account, hash, signature],
    })
  }
}
