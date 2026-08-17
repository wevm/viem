import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'

/**
 * Verifies that a keychain signature was produced by an active access key
 * for the expected account.
 *
 * By default (`admin: true`), returns `true` only if the signature was
 * produced by the account's root key or an active admin access key. Set
 * `admin: false` to accept any active access key.
 *
 * Returns `false` for account mismatches, unknown, revoked, or expired
 * access keys. [TIP-1049](https://tips.sh/1049)
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const valid = await Actions.accessKey.verifyHash(client, {
 *   account: '0x…',
 *   hash: '0x…',
 *   signature: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the keychain signature is valid for the account.
 */
export async function verifyHash<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: verifyHash.Options,
): Promise<verifyHash.ReturnType> {
  const { account, admin, hash, signature, ...rest } = options
  return read(client, {
    ...rest,
    ...verifyHash.call({ account, admin, hash, signature }),
  })
}

export namespace verifyHash {
  export type Args = {
    /** Account address the signature is expected to belong to. */
    account: Address.Address
    /**
     * Whether to require the signer to be the account's root key or an
     * active admin access key. Set to `false` to accept any active access
     * key. @default true
     */
    admin?: boolean | undefined
    /** Original message hash that was signed. */
    hash: Hex.Hex
    /** Keychain signature envelope. */
    signature: Hex.Hex
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = boolean
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to `verifyKeychain` or `verifyKeychainAdmin` on the
   * Signature Verifier precompile (controlled by `admin`).
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { account, admin = true, hash, signature } = args
    return defineCall({
      abi: Abis.signatureVerifier,
      address: Addresses.signatureVerifier,
      args: [account, hash, signature],
      functionName: admin ? 'verifyKeychainAdmin' : 'verifyKeychain',
    })
  }
}
