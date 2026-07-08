import type { Address, Errors } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import type { AccessKeyAccount } from '../../Account.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'
import { resolveAccessKeyAddress } from './internal.js'

/** @internal */
const signatureTypes = {
  0: 'secp256k1',
  1: 'p256',
  2: 'webAuthn',
} as const satisfies Record<number, string>

/** @internal */
const spendPolicies = {
  true: 'limited',
  false: 'unlimited',
} as const

/**
 * Gets the metadata for an access key.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const metadata = await Actions.accessKey.getMetadata(client, {
 *   accessKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The access key metadata.
 */
export async function getMetadata<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getMetadata.Options,
): Promise<getMetadata.ReturnType> {
  const { accessKey, account, ...rest } = options
  const result = await read(client, {
    ...rest,
    ...getMetadata.call(client, { accessKey, account }),
  })
  return {
    address: result.keyId,
    expiry: result.expiry,
    isRevoked: result.isRevoked,
    keyType:
      signatureTypes[result.signatureType as keyof typeof signatureTypes] ??
      'secp256k1',
    spendPolicy: spendPolicies[`${result.enforceLimits}`],
  }
}

export namespace getMetadata {
  export type Args = {
    /** Access key to read the metadata of. */
    accessKey: Address.Address | AccessKeyAccount
    /** Account (or address) that owns the key. @default client.account */
    account?: Account.Account | Address.Address | undefined
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = {
    /** Access key address. */
    address: Address.Address
    /** Unix timestamp when the key expires. */
    expiry: bigint
    /** Whether the key is revoked. */
    isRevoked: boolean
    /** Key type. */
    keyType: 'secp256k1' | 'p256' | 'webAuthn'
    /** Spending policy. */
    spendPolicy: 'limited' | 'unlimited'
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `getKey` function.
   *
   * Can be passed to any action that accepts a contract call. `account`
   * defaults to the client's account when a client is provided.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(...parameters: CallParameters<Args, Client.Client<chain, account>>) {
    const [client, args] = resolveCallParameters(parameters)
    const account_ = args.account ?? client?.account
    if (!account_) throw new Account.NotFoundError()
    const address = typeof account_ === 'string' ? account_ : account_.address
    return defineCall({
      abi: Abis.accountKeychain,
      address: Addresses.accountKeychain,
      args: [address, resolveAccessKeyAddress(args.accessKey)],
      functionName: 'getKey',
    })
  }
}
