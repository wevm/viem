import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js'
import { watchContractEvent } from '../../actions/public/watchContractEvent.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log, Log as viem_Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { Compute, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Creates a Key Publisher that lists the issuer keys ZK signatures may use.
 *
 * The publisher ID derives from the sender and `salt`, so it is known before
 * creation (see `PublisherId.from`). Issuers and key hashes may be passed in
 * any order.
 *
 * [TIP-1132](https://tips.sh/1132)
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.keyPublisher.create(client, {
 *   keys: [
 *     {
 *       issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *       keyHashes: ['0x...'],
 *     },
 *   ],
 *   salt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function create<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: create.Parameters<chain, account>,
): Promise<create.ReturnValue> {
  return create.inner(writeContract, client, parameters)
}

export namespace create {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'initialOwner'> & {
      /** Owner of the publisher. Defaults to the sender. */
      initialOwner?: Address | undefined
    }

  export type Args = {
    /** Owner of the publisher. */
    initialOwner: Address
    /** Issuers and the key hashes to list for each, in any order. */
    keys: readonly {
      /** Issuer hash (`Oidc.hashIssuer`). */
      issuer: Hex
      /** Key hashes to list (`Oidc.hashKey` or `Oidc.fromJwk`). */
      keyHashes: readonly Hex[]
    }[]
    /** Any 32 bytes the sender chooses. */
    salt: Hex
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      initialOwner,
      keys,
      salt,
      ...rest
    } = parameters
    if (!account) throw new Error('`account` is required')
    const call = create.call({
      initialOwner: initialOwner ?? parseAccount(account).address,
      keys,
      salt,
    })
    return action(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `createPublisher` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { initialOwner, keys, salt } = args
    // Merge repeated issuers, since the precompile requires strictly ascending issuers.
    const keyHashes = new Map<string, Hex[]>()
    for (const { issuer, keyHashes: hashes } of keys) {
      const key = issuer.toLowerCase()
      keyHashes.set(key, [...(keyHashes.get(key) ?? []), ...hashes])
    }
    const initialKeys = sortHashes([...keyHashes.keys()] as Hex[]).map(
      (issuer) => ({ issuer, keyHashes: sortHashes(keyHashes.get(issuer)!) }),
    )
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [salt, initialOwner, initialKeys],
      functionName: 'createPublisher',
    })
  }

  /**
   * Extracts the `PublisherCreated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PublisherCreated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.keyPublisher,
      logs,
      eventName: 'PublisherCreated',
      strict: true,
    })
    if (!log) throw new Error('`PublisherCreated` event not found.')
    return log
  }
}

/**
 * Creates a Key Publisher and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { publisherId, receipt } = await Actions.keyPublisher.createSync(client, {
 *   keys: [
 *     {
 *       issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *       keyHashes: ['0x...'],
 *     },
 *   ],
 *   salt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function createSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createSync.Parameters<chain, account>,
): Promise<createSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await create.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = create.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace createSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = create.Parameters<chain, account>

  export type Args = create.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.keyPublisher,
      'PublisherCreated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the key hashes a publisher lists for an issuer, in ascending order.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const keyHashes = await Actions.keyPublisher.getActiveKeys(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The listed key hashes.
 */
export async function getActiveKeys<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getActiveKeys.Parameters,
): Promise<getActiveKeys.ReturnValue> {
  const { issuer, publisherId, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getActiveKeys.call({ issuer, publisherId }),
  })
}

export namespace getActiveKeys {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Issuer hash. */
    issuer: Hex
    /** Publisher ID. */
    publisherId: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.keyPublisher,
    'activeKeys',
    never
  >

  /**
   * Defines a call to the `activeKeys` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { issuer, publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId, issuer],
      functionName: 'activeKeys',
    })
  }
}

/**
 * Gets when a key stops being valid for ZK signatures.
 *
 * Returns `2^64 - 1` while the key is listed, the end of its grace period
 * after `setKeys` drops it, or `0` if it was never listed or was revoked.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const validUntil = await Actions.keyPublisher.getKeyValidUntil(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   keyHash: '0x...',
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The key's validity end, in seconds.
 */
export async function getKeyValidUntil<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getKeyValidUntil.Parameters,
): Promise<getKeyValidUntil.ReturnValue> {
  const { issuer, keyHash, publisherId, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getKeyValidUntil.call({ issuer, keyHash, publisherId }),
  })
}

export namespace getKeyValidUntil {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Issuer hash. */
    issuer: Hex
    /** Key hash. */
    keyHash: Hex
    /** Publisher ID. */
    publisherId: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.keyPublisher,
    'keyValidUntil',
    never
  >

  /**
   * Defines a call to the `keyValidUntil` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { issuer, keyHash, publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId, issuer, keyHash],
      functionName: 'keyValidUntil',
    })
  }
}

/**
 * Gets the owner of a publisher, or the zero address if it does not exist.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const owner = await Actions.keyPublisher.getOwner(client, {
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The owner address.
 */
export async function getOwner<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getOwner.Parameters,
): Promise<getOwner.ReturnValue> {
  const { publisherId, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getOwner.call({ publisherId }),
  })
}

export namespace getOwner {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Publisher ID. */
    publisherId: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.keyPublisher,
    'owner',
    never
  >

  /**
   * Defines a call to the `owner` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId],
      functionName: 'owner',
    })
  }
}

/**
 * Checks whether ZK signatures may use a key in the current block.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const active = await Actions.keyPublisher.isKeyActive(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   keyHash: '0x...',
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the key is active.
 */
export async function isKeyActive<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: isKeyActive.Parameters,
): Promise<isKeyActive.ReturnValue> {
  const { issuer, keyHash, publisherId, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...isKeyActive.call({ issuer, keyHash, publisherId }),
  })
}

export namespace isKeyActive {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Issuer hash. */
    issuer: Hex
    /** Key hash. */
    keyHash: Hex
    /** Publisher ID. */
    publisherId: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.keyPublisher,
    'isKeyActive',
    never
  >

  /**
   * Defines a call to the `isKeyActive` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { issuer, keyHash, publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId, issuer, keyHash],
      functionName: 'isKeyActive',
    })
  }
}

/**
 * Revokes a key immediately, with no grace period.
 *
 * Only the publisher's owner can revoke keys. Revoking an inactive key succeeds.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.keyPublisher.revokeKey(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   keyHash: '0x...',
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function revokeKey<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeKey.Parameters<chain, account>,
): Promise<revokeKey.ReturnValue> {
  return revokeKey.inner(writeContract, client, parameters)
}

export namespace revokeKey {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Issuer hash. */
    issuer: Hex
    /** Key hash to revoke. */
    keyHash: Hex
    /** Publisher ID. */
    publisherId: Hex
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { issuer, keyHash, publisherId, ...rest } = parameters
    const call = revokeKey.call({ issuer, keyHash, publisherId })
    return action(client, {
      ...rest,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `revokeKey` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { issuer, keyHash, publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId, issuer, keyHash],
      functionName: 'revokeKey',
    })
  }

  /**
   * Extracts the `KeyRevoked` event from logs.
   *
   * @param logs - The logs.
   * @returns The `KeyRevoked` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.keyPublisher,
      logs,
      eventName: 'KeyRevoked',
      strict: true,
    })
    if (!log) throw new Error('`KeyRevoked` event not found.')
    return log
  }
}

/**
 * Revokes a key immediately and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.keyPublisher.revokeKeySync(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   keyHash: '0x...',
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function revokeKeySync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeKeySync.Parameters<chain, account>,
): Promise<revokeKeySync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await revokeKey.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = revokeKey.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace revokeKeySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = revokeKey.Parameters<chain, account>

  export type Args = revokeKey.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.keyPublisher,
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
 * Replaces the key hashes a publisher lists for an issuer.
 *
 * Previously listed keys that are left out stay valid for a one-hour grace
 * period, so sign-ins in progress survive a rotation. Key hashes may be passed
 * in any order. Only the publisher's owner can set keys.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.keyPublisher.setKeys(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   keyHashes: ['0x...', '0x...'],
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setKeys<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setKeys.Parameters<chain, account>,
): Promise<setKeys.ReturnValue> {
  return setKeys.inner(writeContract, client, parameters)
}

export namespace setKeys {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Issuer hash. */
    issuer: Hex
    /** Key hashes to list for the issuer, in any order. Replaces the current list. */
    keyHashes: readonly Hex[]
    /** Publisher ID. */
    publisherId: Hex
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { issuer, keyHashes, publisherId, ...rest } = parameters
    const call = setKeys.call({ issuer, keyHashes, publisherId })
    return action(client, {
      ...rest,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `setKeys` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { issuer, keyHashes, publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId, issuer, sortHashes(keyHashes)],
      functionName: 'setKeys',
    })
  }

  /**
   * Extracts the `KeysSet` event from logs.
   *
   * @param logs - The logs.
   * @returns The `KeysSet` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.keyPublisher,
      logs,
      eventName: 'KeysSet',
      strict: true,
    })
    if (!log) throw new Error('`KeysSet` event not found.')
    return log
  }
}

/**
 * Replaces the key hashes a publisher lists for an issuer and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions, Oidc } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { graceUntil, receipt } = await Actions.keyPublisher.setKeysSync(client, {
 *   issuer: Oidc.hashIssuer('https://accounts.google.com'),
 *   keyHashes: ['0x...', '0x...'],
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setKeysSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setKeysSync.Parameters<chain, account>,
): Promise<setKeysSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setKeys.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = setKeys.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace setKeysSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setKeys.Parameters<chain, account>

  export type Args = setKeys.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.keyPublisher,
      'KeysSet',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Transfers ownership of a publisher.
 *
 * Only the current owner can transfer ownership.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.keyPublisher.transferOwnership(client, {
 *   newOwner: '0x...',
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function transferOwnership<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: transferOwnership.Parameters<chain, account>,
): Promise<transferOwnership.ReturnValue> {
  return transferOwnership.inner(writeContract, client, parameters)
}

export namespace transferOwnership {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** New owner of the publisher. */
    newOwner: Address
    /** Publisher ID. */
    publisherId: Hex
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { newOwner, publisherId, ...rest } = parameters
    const call = transferOwnership.call({ newOwner, publisherId })
    return action(client, {
      ...rest,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `transferOwnership` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { newOwner, publisherId } = args
    return defineCall({
      address: Addresses.keyPublisher,
      abi: Abis.keyPublisher,
      args: [publisherId, newOwner],
      functionName: 'transferOwnership',
    })
  }

  /**
   * Extracts the `OwnershipTransferred` event from logs.
   *
   * @param logs - The logs.
   * @returns The `OwnershipTransferred` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.keyPublisher,
      logs,
      eventName: 'OwnershipTransferred',
      strict: true,
    })
    if (!log) throw new Error('`OwnershipTransferred` event not found.')
    return log
  }
}

/**
 * Transfers ownership of a publisher and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { newOwner, receipt } = await Actions.keyPublisher.transferOwnershipSync(client, {
 *   newOwner: '0x...',
 *   publisherId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function transferOwnershipSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: transferOwnershipSync.Parameters<chain, account>,
): Promise<transferOwnershipSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await transferOwnership.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = transferOwnership.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace transferOwnershipSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = transferOwnership.Parameters<chain, account>

  export type Args = transferOwnership.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.keyPublisher,
      'OwnershipTransferred',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Watches for publisher creation events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.keyPublisher.watchCreate(client, {
 *   onPublisherCreated: (args, log) => {
 *     console.log('Publisher created:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchCreate<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchCreate.Parameters,
) {
  const { onPublisherCreated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.keyPublisher,
    abi: Abis.keyPublisher,
    eventName: 'PublisherCreated',
    onLogs: (logs) => {
      for (const log of logs) onPublisherCreated(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchCreate {
  export type Args = GetEventArgs<
    typeof Abis.keyPublisher,
    'PublisherCreated',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.keyPublisher, 'PublisherCreated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.keyPublisher,
      'PublisherCreated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a publisher is created. */
    onPublisherCreated: (args: Args, log: Log) => void
  }
}

/**
 * Watches for key revocation events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.keyPublisher.watchKeyRevoked(client, {
 *   onKeyRevoked: (args, log) => {
 *     console.log('Key revoked:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchKeyRevoked<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchKeyRevoked.Parameters,
) {
  const { onKeyRevoked, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.keyPublisher,
    abi: Abis.keyPublisher,
    eventName: 'KeyRevoked',
    onLogs: (logs) => {
      for (const log of logs) onKeyRevoked(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchKeyRevoked {
  export type Args = GetEventArgs<
    typeof Abis.keyPublisher,
    'KeyRevoked',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.keyPublisher, 'KeyRevoked'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.keyPublisher, 'KeyRevoked', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a key is revoked. */
    onKeyRevoked: (args: Args, log: Log) => void
  }
}

/**
 * Watches for events that replace an issuer's listed keys.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.keyPublisher.watchKeysSet(client, {
 *   onKeysSet: (args, log) => {
 *     console.log('Keys set:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchKeysSet<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchKeysSet.Parameters,
) {
  const { onKeysSet, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.keyPublisher,
    abi: Abis.keyPublisher,
    eventName: 'KeysSet',
    onLogs: (logs) => {
      for (const log of logs) onKeysSet(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchKeysSet {
  export type Args = GetEventArgs<
    typeof Abis.keyPublisher,
    'KeysSet',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.keyPublisher, 'KeysSet'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.keyPublisher, 'KeysSet', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when an issuer's keys are replaced. */
    onKeysSet: (args: Args, log: Log) => void
  }
}

/**
 * Watches for publisher ownership transfer events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.keyPublisher.watchOwnershipTransferred(client, {
 *   onOwnershipTransferred: (args, log) => {
 *     console.log('Ownership transferred:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchOwnershipTransferred<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchOwnershipTransferred.Parameters,
) {
  const { onOwnershipTransferred, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.keyPublisher,
    abi: Abis.keyPublisher,
    eventName: 'OwnershipTransferred',
    onLogs: (logs) => {
      for (const log of logs) onOwnershipTransferred(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchOwnershipTransferred {
  export type Args = GetEventArgs<
    typeof Abis.keyPublisher,
    'OwnershipTransferred',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.keyPublisher, 'OwnershipTransferred'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.keyPublisher,
      'OwnershipTransferred',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when ownership of a publisher is transferred. */
    onOwnershipTransferred: (args: Args, log: Log) => void
  }
}

// The precompile requires strictly ascending field elements, so sort numerically and drop repeats.
function sortHashes(hashes: readonly Hex[]): Hex[] {
  const unique = [...new Set(hashes.map((hash) => hash.toLowerCase() as Hex))]
  return unique.sort((a, b) => {
    const left = BigInt(a)
    const right = BigInt(b)
    return left < right ? -1 : left > right ? 1 : 0
  })
}
