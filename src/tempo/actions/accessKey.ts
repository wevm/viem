import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import { sendTransaction } from '../../actions/wallet/sendTransaction.js'
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Compute } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import type { AccessKeyAccount, RootAccount } from '../Account.js'
import { signKeyAuthorization } from '../Account.js'
import * as Addresses from '../Addresses.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
} from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

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
 * Authorizes an access key by signing a key authorization and sending a transaction.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Account } from 'viem/tempo'
 * import { generatePrivateKey } from 'viem/accounts'
 *
 * const account = Account.from({ privateKey: '0x...' })
 * const client = createClient({
 *   account,
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(generatePrivateKey(), {
 *   access: account,
 * })
 *
 * const hash = await Actions.accessKey.authorize(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function authorize<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: authorize.Parameters<chain, account>,
): Promise<authorize.ReturnValue> {
  return authorize.inner(sendTransaction, client, parameters)
}

export namespace authorize {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The access key to authorize. */
    accessKey: Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'>
    /** Unix timestamp when the key expires. */
    expiry?: number | undefined
    /** Spending limits per token. */
    limits?: { token: Address; limit: bigint }[] | undefined
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof sendTransaction | typeof sendTransactionSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: authorize.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { accessKey, expiry, limits, ...rest } = parameters
    const account_ = rest.account ?? client.account
    if (!account_) throw new Error('account is required.')
    const parsed = parseAccount(account_)
    const keyAuthorization = await signKeyAuthorization(parsed as never, {
      key: accessKey,
      expiry,
      limits,
    })
    return (await action(client, {
      ...rest,
      keyAuthorization,
    } as never)) as never
  }

  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.accountKeychain,
      logs,
      eventName: 'KeyAuthorized',
      strict: true,
    })
    if (!log) throw new Error('`KeyAuthorized` event not found.')
    return log
  }
}

/**
 * Authorizes an access key and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Account } from 'viem/tempo'
 * import { generatePrivateKey } from 'viem/accounts'
 *
 * const account = Account.from({ privateKey: '0x...' })
 * const client = createClient({
 *   account,
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(generatePrivateKey(), {
 *   access: account,
 * })
 *
 * const { receipt, ...result } = await Actions.accessKey.authorizeSync(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function authorizeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: authorizeSync.Parameters<chain, account>,
): Promise<authorizeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await authorize.inner(sendTransactionSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = authorize.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace authorizeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = authorize.Parameters<chain, account>

  export type Args = authorize.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.accountKeychain,
      'KeyAuthorized',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Revokes an authorized access key.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.accessKey.revoke(client, {
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function revoke<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revoke.Parameters<chain, account>,
): Promise<revoke.ReturnValue> {
  return revoke.inner(writeContract, client, parameters)
}

export namespace revoke {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The access key to revoke. */
    accessKey: Address | AccessKeyAccount
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: revoke.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { accessKey, ...rest } = parameters
    const call = revoke.call({ accessKey })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `revokeKey` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const hash = await client.sendTransaction({
   *   calls: [
   *     Actions.accessKey.revoke.call({ accessKey: '0x...' }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { accessKey } = args
    return defineCall({
      address: Addresses.accountKeychain,
      abi: Abis.accountKeychain,
      functionName: 'revokeKey',
      args: [resolveAccessKey(accessKey)],
    })
  }

  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.accountKeychain,
      logs,
      eventName: 'KeyRevoked',
      strict: true,
    })
    if (!log) throw new Error('`KeyRevoked` event not found.')
    return log
  }
}

/**
 * Revokes an authorized access key and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const result = await Actions.accessKey.revokeSync(client, {
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function revokeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeSync.Parameters<chain, account>,
): Promise<revokeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await revoke.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = revoke.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace revokeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = revoke.Parameters<chain, account>

  export type Args = revoke.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.accountKeychain,
      'KeyRevoked',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Updates the spending limit for a specific token on an authorized access key.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.accessKey.updateLimit(client, {
 *   accessKey: '0x...',
 *   token: '0x...',
 *   limit: 1000000000000000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function updateLimit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateLimit.Parameters<chain, account>,
): Promise<updateLimit.ReturnValue> {
  return updateLimit.inner(writeContract, client, parameters)
}

export namespace updateLimit {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The access key to update. */
    accessKey: Address | AccessKeyAccount
    /** The token address. */
    token: Address
    /** The new spending limit. */
    limit: bigint
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: updateLimit.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { accessKey, token, limit, ...rest } = parameters
    const call = updateLimit.call({ accessKey, token, limit })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `updateSpendingLimit` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const hash = await client.sendTransaction({
   *   calls: [
   *     Actions.accessKey.updateLimit.call({
   *       accessKey: '0x...',
   *       token: '0x...',
   *       limit: 1000000000000000000n,
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { accessKey, token, limit } = args
    return defineCall({
      address: Addresses.accountKeychain,
      abi: Abis.accountKeychain,
      functionName: 'updateSpendingLimit',
      args: [resolveAccessKey(accessKey), token, limit],
    })
  }

  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.accountKeychain,
      logs,
      eventName: 'SpendingLimitUpdated',
      strict: true,
    })
    if (!log) throw new Error('`SpendingLimitUpdated` event not found.')
    return log
  }
}

/**
 * Updates the spending limit and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const result = await Actions.accessKey.updateLimitSync(client, {
 *   accessKey: '0x...',
 *   token: '0x...',
 *   limit: 1000000000000000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function updateLimitSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateLimitSync.Parameters<chain, account>,
): Promise<updateLimitSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await updateLimit.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = updateLimit.extractEvent(receipt.logs)
  return {
    account: args.account,
    publicKey: args.publicKey,
    token: args.token,
    limit: args.newLimit,
    receipt,
  }
}

export namespace updateLimitSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = updateLimit.Parameters<chain, account>

  export type Args = updateLimit.Args

  export type ReturnValue = {
    /** The account that owns the key. */
    account: Address
    /** The access key address. */
    publicKey: Address
    /** The token address. */
    token: Address
    /** The new spending limit. */
    limit: bigint
    /** The transaction receipt. */
    receipt: TransactionReceipt
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets access key information.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const key = await Actions.accessKey.getMetadata(client, {
 *   account: '0x...',
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The key information.
 */
export async function getMetadata<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getMetadata.Parameters<account>,
): Promise<getMetadata.ReturnValue> {
  const { account: account_ = client.account, accessKey, ...rest } = parameters
  if (!account_) throw new Error('account is required.')
  const account = parseAccount(account_)
  const result = await readContract(client, {
    ...rest,
    ...getMetadata.call({ account: account.address, accessKey }),
  })
  return {
    address: result.keyId,
    keyType:
      signatureTypes[result.signatureType as keyof typeof signatureTypes] ??
      'secp256k1',
    expiry: result.expiry,
    spendPolicy: spendPolicies[`${result.enforceLimits}`],
    isRevoked: result.isRevoked,
  }
}

export namespace getMetadata {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters & GetAccountParameter<account> & Pick<Args, 'accessKey'>

  export type Args = {
    /** Account address. */
    account: Address
    /** The access key. */
    accessKey: Address | AccessKeyAccount
  }

  export type ReturnValue = {
    /** The access key address. */
    address: Address
    /** The key type. */
    keyType: 'secp256k1' | 'p256' | 'webAuthn'
    /** The expiry timestamp. */
    expiry: bigint
    /** The spending policy. */
    spendPolicy: 'limited' | 'unlimited'
    /** Whether the key is revoked. */
    isRevoked: boolean
  }

  /**
   * Defines a call to the `getKey` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, accessKey } = args
    return defineCall({
      address: Addresses.accountKeychain,
      abi: Abis.accountKeychain,
      functionName: 'getKey',
      args: [account, resolveAccessKey(accessKey)],
    })
  }
}

/**
 * Gets the remaining spending limit for a key-token pair.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const remaining = await Actions.accessKey.getRemainingLimit(client, {
 *   account: '0x...',
 *   accessKey: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The remaining spending amount.
 */
export async function getRemainingLimit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getRemainingLimit.Parameters<account>,
): Promise<getRemainingLimit.ReturnValue> {
  const {
    account: account_ = client.account,
    accessKey,
    token,
    ...rest
  } = parameters
  if (!account_) throw new Error('account is required.')
  const account = parseAccount(account_)
  return readContract(client, {
    ...rest,
    ...getRemainingLimit.call({ account: account.address, accessKey, token }),
  })
}

export namespace getRemainingLimit {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters &
    GetAccountParameter<account> &
    Pick<Args, 'accessKey' | 'token'>

  export type Args = {
    /** Account address. */
    account: Address
    /** The access key. */
    accessKey: Address | AccessKeyAccount
    /** The token address. */
    token: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.accountKeychain,
    'getRemainingLimit',
    never
  >

  /**
   * Defines a call to the `getRemainingLimit` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, accessKey, token } = args
    return defineCall({
      address: Addresses.accountKeychain,
      abi: Abis.accountKeychain,
      functionName: 'getRemainingLimit',
      args: [account, resolveAccessKey(accessKey), token],
    })
  }
}

/**
 * Signs a key authorization for an access key.
 *
 * @example
 * ```ts
 * import { generatePrivateKey } from 'viem/accounts'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const account = Account.from({ privateKey: '0x...' })
 * const accessKey = Account.fromP256(generatePrivateKey(), {
 *   access: account,
 * })
 *
 * const keyAuthorization = await Actions.accessKey.signAuthorization(
 *   account,
 *   {
 *     accessKey,
 *     expiry: Math.floor((Date.now() + 30_000) / 1000),
 *   },
 * )
 * ```
 *
 * @param account - The root account signing the authorization.
 * @param parameters - Parameters.
 * @returns The signed key authorization.
 */
export async function signAuthorization(
  account: RootAccount,
  parameters: signAuthorization.Parameters,
): Promise<signAuthorization.ReturnValue> {
  const { accessKey, ...rest } = parameters
  return signKeyAuthorization(account, { key: accessKey, ...rest })
}

export namespace signAuthorization {
  export type Parameters = {
    /** The access key to authorize. */
    accessKey: Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'>
    /** Unix timestamp when the key expires. */
    expiry?: number | undefined
    /** Spending limits per token. */
    limits?: { token: Address; limit: bigint }[] | undefined
  }

  export type ReturnValue = Awaited<ReturnType<typeof signKeyAuthorization>>
}

/** @internal */
function resolveAccessKey(accessKey: Address | AccessKeyAccount): Address {
  if (typeof accessKey === 'string') return accessKey
  return accessKey.accessKeyAddress
}
