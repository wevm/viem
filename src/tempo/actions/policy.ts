import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'

import type * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/Errors.js'
import { read } from '../../core/actions/contract/read.js'
import { watchEvent } from '../../core/actions/contract/watchEvent.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/** Maps policy types to their TIP-403 numeric representation. @internal */
const policyTypeMap = {
  whitelist: 0,
  blacklist: 1,
} as const

/**
 * Creates a new policy.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.create(client, {
 *   type: 'whitelist',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function create<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: create.Options<account>,
): Promise<create.ReturnType> {
  return create.inner(write, client, options)
}

export namespace create {
  export type Args = {
    /** Accounts to initialize the policy with. */
    addresses?: readonly Address.Address[] | undefined
    /** Address of the policy admin. */
    admin: Address.Address
    /** Type of policy to create. */
    type: PolicyType
  }

  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = WriteParameters &
    Omit<Args, 'admin'> &
    (account extends Account.Account
      ? {
          /** Policy admin (or address). @default client.account */
          admin?: Account.Account | Address.Address | undefined
        }
      : {
          /** Policy admin (or address). */
          admin: Account.Account | Address.Address
        })

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: create.Options,
  ): Promise<ActionReturnType<action>> {
    const { addresses, admin: admin_ = client.account, type, ...rest } = options
    if (!admin_) throw new BaseError('admin is required.')
    const admin = typeof admin_ === 'string' ? admin_ : admin_.address
    return (await action(client, {
      ...rest,
      ...create.call({ addresses, admin, type }),
    } as never)) as never
  }

  /**
   * Defines a call to the `createPolicy` (or `createPolicyWithAccounts`, when
   * `addresses` is given) function. Can be passed to any action that accepts a
   * contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { addresses, admin, type } = args
    const callArgs = addresses
      ? ({
          args: [admin, policyTypeMap[type], addresses],
          functionName: 'createPolicyWithAccounts',
        } as const)
      : ({
          args: [admin, policyTypeMap[type]],
          functionName: 'createPolicy',
        } as const)
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      ...callArgs,
    } as never)
  }

  /** Extracts the `PolicyCreated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'PolicyCreated',
      strict: true,
    })
    if (!log) throw new BaseError('`PolicyCreated` event not found.')
    return log
  }
}

/**
 * Creates a new policy, and waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { policyId } = await Actions.policy.createSync(client, {
 *   type: 'whitelist',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function createSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: createSync.Options<account>,
): Promise<createSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await create.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = create.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace createSync {
  type Args = create.Args

  type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = create.Options<account>

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Policy ID. */
    policyId: bigint
    /** Address that created the policy. */
    updater: Address.Address
    /** Policy type: 0 for whitelist, 1 for blacklist. */
    policyType: number
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets policy data.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const data = await Actions.policy.getData(client, {
 *   policyId: 2n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The policy data.
 */
export async function getData<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getData.Options,
): Promise<getData.ReturnType> {
  const { policyId, ...rest } = options
  const [policyType, admin] = (await read(client, {
    ...rest,
    ...getData.call({ policyId }),
  } as never)) as read.ReturnType<typeof Abis.tip403Registry, 'policyData'>
  return {
    admin,
    type: policyType === 0 ? 'whitelist' : 'blacklist',
  }
}

export namespace getData {
  export type Args = {
    /** Policy ID. */
    policyId: bigint
  }

  export type Options = ReadParameters & Args

  export type ReturnType = {
    /** Admin address. */
    admin: Address.Address
    /** Policy type. */
    type: PolicyType
  }

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `policyData` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [policyId],
      functionName: 'policyData',
    } as never)
  }
}

/**
 * Checks if a user is authorized by a policy.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const authorized = await Actions.policy.isAuthorized(client, {
 *   policyId: 2n,
 *   user: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the user is authorized.
 */
export async function isAuthorized<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: isAuthorized.Options,
): Promise<isAuthorized.ReturnType> {
  const { policyId, user, ...rest } = options
  return (await read(client, {
    ...rest,
    ...isAuthorized.call({ policyId, user }),
  } as never)) as isAuthorized.ReturnType
}

export namespace isAuthorized {
  export type Args = {
    /** Policy ID. */
    policyId: bigint
    /** User address to check. */
    user: Address.Address
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.tip403Registry,
    'isAuthorized'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `isAuthorized` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId, user } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [policyId, user],
      functionName: 'isAuthorized',
    } as never)
  }
}

/**
 * Modifies a policy blacklist.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.modifyBlacklist(client, {
 *   address: '0x…',
 *   policyId: 2n,
 *   restricted: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function modifyBlacklist<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyBlacklist.Options,
): Promise<modifyBlacklist.ReturnType> {
  return modifyBlacklist.inner(write, client, options)
}

export namespace modifyBlacklist {
  export type Args = {
    /** Target account address. */
    address: Address.Address
    /** Policy ID. */
    policyId: bigint
    /** Whether the account is restricted. */
    restricted: boolean
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: modifyBlacklist.Options,
  ): Promise<ActionReturnType<action>> {
    const { address, policyId, restricted, ...rest } = options
    return (await action(client, {
      ...rest,
      ...modifyBlacklist.call({ address, policyId, restricted }),
    } as never)) as never
  }

  /**
   * Defines a call to the `modifyPolicyBlacklist` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { address, policyId, restricted } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [policyId, address, restricted],
      functionName: 'modifyPolicyBlacklist',
    } as never)
  }

  /** Extracts the `BlacklistUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'BlacklistUpdated',
      strict: true,
    })
    if (!log) throw new BaseError('`BlacklistUpdated` event not found.')
    return log
  }
}

/**
 * Modifies a policy blacklist, and waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.policy.modifyBlacklistSync(
 *   client,
 *   { address: '0x…', policyId: 2n, restricted: true },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function modifyBlacklistSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyBlacklistSync.Options,
): Promise<modifyBlacklistSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await modifyBlacklist.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = modifyBlacklist.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace modifyBlacklistSync {
  type Args = modifyBlacklist.Args

  type Options = modifyBlacklist.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Policy ID. */
    policyId: bigint
    /** Address that updated the blacklist. */
    updater: Address.Address
    /** Account whose blacklist status changed. */
    account: Address.Address
    /** Whether the account is restricted. */
    restricted: boolean
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Modifies a policy whitelist.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.modifyWhitelist(client, {
 *   address: '0x…',
 *   allowed: true,
 *   policyId: 2n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function modifyWhitelist<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyWhitelist.Options,
): Promise<modifyWhitelist.ReturnType> {
  return modifyWhitelist.inner(write, client, options)
}

export namespace modifyWhitelist {
  export type Args = {
    /** Target account address. */
    address: Address.Address
    /** Whether the account is allowed. */
    allowed: boolean
    /** Policy ID. */
    policyId: bigint
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: modifyWhitelist.Options,
  ): Promise<ActionReturnType<action>> {
    const { address, allowed, policyId, ...rest } = options
    return (await action(client, {
      ...rest,
      ...modifyWhitelist.call({ address, allowed, policyId }),
    } as never)) as never
  }

  /**
   * Defines a call to the `modifyPolicyWhitelist` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { address, allowed, policyId } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [policyId, address, allowed],
      functionName: 'modifyPolicyWhitelist',
    } as never)
  }

  /** Extracts the `WhitelistUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'WhitelistUpdated',
      strict: true,
    })
    if (!log) throw new BaseError('`WhitelistUpdated` event not found.')
    return log
  }
}

/**
 * Modifies a policy whitelist, and waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.policy.modifyWhitelistSync(
 *   client,
 *   { address: '0x…', allowed: true, policyId: 2n },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function modifyWhitelistSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: modifyWhitelistSync.Options,
): Promise<modifyWhitelistSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await modifyWhitelist.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = modifyWhitelist.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace modifyWhitelistSync {
  type Args = modifyWhitelist.Args

  type Options = modifyWhitelist.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Policy ID. */
    policyId: bigint
    /** Address that updated the whitelist. */
    updater: Address.Address
    /** Account whose whitelist status changed. */
    account: Address.Address
    /** Whether the account is allowed. */
    allowed: boolean
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/** Type of a TIP-403 policy. */
export type PolicyType = 'whitelist' | 'blacklist'

/**
 * Sets the admin for a policy.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.setAdmin(client, {
 *   admin: '0x…',
 *   policyId: 2n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setAdmin<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setAdmin.Options,
): Promise<setAdmin.ReturnType> {
  return setAdmin.inner(write, client, options)
}

export namespace setAdmin {
  export type Args = {
    /** New admin address. */
    admin: Address.Address
    /** Policy ID. */
    policyId: bigint
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: setAdmin.Options,
  ): Promise<ActionReturnType<action>> {
    const { admin, policyId, ...rest } = options
    return (await action(client, {
      ...rest,
      ...setAdmin.call({ admin, policyId }),
    } as never)) as never
  }

  /**
   * Defines a call to the `setPolicyAdmin` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { admin, policyId } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [policyId, admin],
      functionName: 'setPolicyAdmin',
    } as never)
  }

  /** Extracts the `PolicyAdminUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'PolicyAdminUpdated',
      strict: true,
    })
    if (!log) throw new BaseError('`PolicyAdminUpdated` event not found.')
    return log
  }
}

/**
 * Sets the admin for a policy, and waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.policy.setAdminSync(client, {
 *   admin: '0x…',
 *   policyId: 2n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setAdminSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setAdminSync.Options,
): Promise<setAdminSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await setAdmin.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setAdmin.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace setAdminSync {
  type Args = setAdmin.Args

  type Options = setAdmin.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Policy ID. */
    policyId: bigint
    /** Address that updated the admin. */
    updater: Address.Address
    /** New admin address. */
    admin: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for policy admin update events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.policy.watchAdminUpdated(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchAdminUpdated(
  client: Client.Client,
  options: watchAdminUpdated.Options = {},
): watchAdminUpdated.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'PolicyAdminUpdated',
    strict: true,
  } as never) as watchAdminUpdated.ReturnType
}

export declare namespace watchAdminUpdated {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'PolicyAdminUpdated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for blacklist update events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.policy.watchBlacklistUpdated(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchBlacklistUpdated(
  client: Client.Client,
  options: watchBlacklistUpdated.Options = {},
): watchBlacklistUpdated.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'BlacklistUpdated',
    strict: true,
  } as never) as watchBlacklistUpdated.ReturnType
}

export declare namespace watchBlacklistUpdated {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'BlacklistUpdated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for policy creation events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.policy.watchCreate(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchCreate(
  client: Client.Client,
  options: watchCreate.Options = {},
): watchCreate.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'PolicyCreated',
    strict: true,
  } as never) as watchCreate.ReturnType
}

export declare namespace watchCreate {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'PolicyCreated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for whitelist update events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.policy.watchWhitelistUpdated(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchWhitelistUpdated(
  client: Client.Client,
  options: watchWhitelistUpdated.Options = {},
): watchWhitelistUpdated.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'WhitelistUpdated',
    strict: true,
  } as never) as watchWhitelistUpdated.ReturnType
}

export declare namespace watchWhitelistUpdated {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'WhitelistUpdated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>
