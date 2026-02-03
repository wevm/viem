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
import type { Compute, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

export type PolicyType = 'whitelist' | 'blacklist'

const policyTypeMap = {
  whitelist: 0,
  blacklist: 1,
} as const

/**
 * Creates a new policy.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { hash, policyId } = await Actions.policy.create(client, {
 *   admin: '0x...',
 *   type: 'whitelist',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash and policy ID.
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
    Omit<Args, 'admin'> & {
      /** Address of the policy admin. */
      admin?: Address | undefined
    }

  export type Args = {
    /** Optional array of accounts to initialize the policy with. */
    addresses?: readonly Address[] | undefined
    /** Address of the policy admin. */
    admin: Address
    /** Type of policy to create. */
    type: PolicyType
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
      addresses,
      chain = client.chain,
      type,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const admin = parseAccount(account).address!

    const call = create.call({ admin, type, addresses })
    return action(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `createPolicy` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.policy.create.call({
   *       admin: '0xfeed...fede',
   *       type: 'whitelist',
   *     }),
   *     actions.policy.create.call({
   *       admin: '0xfeed...fede',
   *       type: 'blacklist',
   *       addresses: ['0x20c0...beef', '0x20c0...babe'],
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { admin, type, addresses } = args
    const config = (() => {
      if (addresses)
        return {
          functionName: 'createPolicyWithAccounts',
          args: [admin, policyTypeMap[type], addresses],
        } as const
      return {
        functionName: 'createPolicy',
        args: [admin, policyTypeMap[type]],
      } as const
    })()
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      ...config,
    })
  }

  /**
   * Extracts the `PolicyCreated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PolicyCreated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip403Registry,
      logs,
      eventName: 'PolicyCreated',
      strict: true,
    })
    if (!log) throw new Error('`PolicyCreated` event not found.')
    return log
  }
}

/**
 * Creates a new policy.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.policy.createSync(client, {
 *   admin: '0x...',
 *   type: 'whitelist',
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
      typeof Abis.tip403Registry,
      'PolicyCreated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Sets the admin for a policy.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.setAdmin(client, {
 *   policyId: 2n,
 *   admin: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setAdmin<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setAdmin.Parameters<chain, account>,
): Promise<setAdmin.ReturnValue> {
  return setAdmin.inner(writeContract, client, parameters)
}

export namespace setAdmin {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** New admin address. */
    admin: Address
    /** Policy ID. */
    policyId: bigint
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
    parameters: setAdmin.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { policyId, admin, ...rest } = parameters
    const call = setAdmin.call({ policyId, admin })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `setPolicyAdmin` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.policy.setAdmin.call({
   *       policyId: 2n,
   *       admin: '0xfeed...fede',
   *     }),
   *     actions.policy.setAdmin.call({
   *       policyId: 3n,
   *       admin: '0xfeed...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId, admin } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      functionName: 'setPolicyAdmin',
      args: [policyId, admin],
    })
  }

  /**
   * Extracts the `PolicyAdminUpdated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PolicyAdminUpdated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip403Registry,
      logs,
      eventName: 'PolicyAdminUpdated',
      strict: true,
    })
    if (!log) throw new Error('`PolicyAdminUpdated` event not found.')
    return log
  }
}

/**
 * Sets the admin for a policy.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.policy.setAdminSync(client, {
 *   policyId: 2n,
 *   admin: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setAdminSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setAdminSync.Parameters<chain, account>,
): Promise<setAdminSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setAdmin.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setAdmin.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace setAdminSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setAdmin.Parameters<chain, account>

  export type Args = setAdmin.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip403Registry,
      'PolicyAdminUpdated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Modifies a policy whitelist.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.modifyWhitelist(client, {
 *   policyId: 2n,
 *   account: '0x...',
 *   allowed: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function modifyWhitelist<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: modifyWhitelist.Parameters<chain, account>,
): Promise<modifyWhitelist.ReturnValue> {
  return modifyWhitelist.inner(writeContract, client, parameters)
}

export namespace modifyWhitelist {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Target account address. */
    address: Address
    /** Whether the account is allowed. */
    allowed: boolean
    /** Policy ID. */
    policyId: bigint
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
    parameters: modifyWhitelist.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { address: targetAccount, allowed, policyId, ...rest } = parameters
    const call = modifyWhitelist.call({
      address: targetAccount,
      allowed,
      policyId,
    })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `modifyPolicyWhitelist` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.policy.modifyWhitelist.call({
   *       policyId: 2n,
   *       address: '0x20c0...beef',
   *       allowed: true,
   *     }),
   *     actions.policy.modifyWhitelist.call({
   *       policyId: 2n,
   *       address: '0x20c0...babe',
   *       allowed: false,
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId, address, allowed } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      functionName: 'modifyPolicyWhitelist',
      args: [policyId, address, allowed],
    })
  }

  /**
   * Extracts the `WhitelistUpdated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `WhitelistUpdated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip403Registry,
      logs,
      eventName: 'WhitelistUpdated',
      strict: true,
    })
    if (!log) throw new Error('`WhitelistUpdated` event not found.')
    return log
  }
}

/**
 * Modifies a policy whitelist.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.policy.modifyWhitelistSync(client, {
 *   policyId: 2n,
 *   account: '0x...',
 *   allowed: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function modifyWhitelistSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: modifyWhitelistSync.Parameters<chain, account>,
): Promise<modifyWhitelistSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await modifyWhitelist.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = modifyWhitelist.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace modifyWhitelistSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = modifyWhitelist.Parameters<chain, account>

  export type Args = modifyWhitelist.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip403Registry,
      'WhitelistUpdated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Modifies a policy blacklist.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.policy.modifyBlacklist(client, {
 *   policyId: 2n,
 *   account: '0x...',
 *   restricted: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function modifyBlacklist<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: modifyBlacklist.Parameters<chain, account>,
): Promise<modifyBlacklist.ReturnValue> {
  return modifyBlacklist.inner(writeContract, client, parameters)
}

export namespace modifyBlacklist {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Target account address. */
    address: Address
    /** Policy ID. */
    policyId: bigint
    /** Whether the account is restricted. */
    restricted: boolean
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
    parameters: modifyBlacklist.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { address: targetAccount, policyId, restricted, ...rest } = parameters
    const call = modifyBlacklist.call({
      address: targetAccount,
      policyId,
      restricted,
    })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `modifyPolicyBlacklist` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     actions.policy.modifyBlacklist.call({
   *       policyId: 2n,
   *       address: '0x20c0...beef',
   *       restricted: true,
   *     }),
   *     actions.policy.modifyBlacklist.call({
   *       policyId: 2n,
   *       address: '0x20c0...babe',
   *       restricted: false,
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId, address, restricted } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      functionName: 'modifyPolicyBlacklist',
      args: [policyId, address, restricted],
    })
  }

  /**
   * Extracts the `BlacklistUpdated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `BlacklistUpdated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip403Registry,
      logs,
      eventName: 'BlacklistUpdated',
      strict: true,
    })
    if (!log) throw new Error('`BlacklistUpdated` event not found.')
    return log
  }
}

/**
 * Modifies a policy blacklist.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const result = await Actions.policy.modifyBlacklistSync(client, {
 *   policyId: 2n,
 *   account: '0x...',
 *   restricted: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function modifyBlacklistSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: modifyBlacklistSync.Parameters<chain, account>,
): Promise<modifyBlacklistSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await modifyBlacklist.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = modifyBlacklist.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace modifyBlacklistSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = modifyBlacklist.Parameters<chain, account>

  export type Args = modifyBlacklist.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip403Registry,
      'BlacklistUpdated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets policy data.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const data = await Actions.policy.getData(client, {
 *   policyId: 2n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The policy data.
 */
export async function getData<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getData.Parameters,
): Promise<getData.ReturnValue> {
  const { policyId, ...rest } = parameters
  const result = await readContract(client, {
    ...rest,
    ...getData.call({ policyId }),
  })
  return {
    admin: result[1],
    type: result[0] === 0 ? 'whitelist' : 'blacklist',
  }
}

export namespace getData {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Policy ID. */
    policyId: bigint
  }

  export type ReturnValue = Compute<{
    /** Admin address. */
    admin: Address
    /** Policy type. */
    type: PolicyType
  }>

  /**
   * Defines a call to the `policyData` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      args: [policyId],
      functionName: 'policyData',
    })
  }
}

/**
 * Checks if a user is authorized by a policy.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const authorized = await Actions.policy.isAuthorized(client, {
 *   policyId: 2n,
 *   user: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the user is authorized.
 */
export async function isAuthorized<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: isAuthorized.Parameters,
): Promise<isAuthorized.ReturnValue> {
  const { policyId, user, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...isAuthorized.call({ policyId, user }),
  })
}

export namespace isAuthorized {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Policy ID. */
    policyId: bigint
    /** User address to check. */
    user: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip403Registry,
    'isAuthorized',
    never
  >

  /**
   * Defines a call to the `isAuthorized` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId, user } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      args: [policyId, user],
      functionName: 'isAuthorized',
    })
  }
}

/**
 * Watches for policy creation events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.policy.watchCreate(client, {
 *   onPolicyCreated: (args, log) => {
 *     console.log('Policy created:', args)
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
  const { onPolicyCreated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.tip403Registry,
    abi: Abis.tip403Registry,
    eventName: 'PolicyCreated',
    onLogs: (logs) => {
      for (const log of logs)
        onPolicyCreated(
          {
            ...log.args,
            type: log.args.policyType === 0 ? 'whitelist' : 'blacklist',
          },
          log,
        )
    },
    strict: true,
  })
}

export declare namespace watchCreate {
  export type Args = Compute<{
    policyId: bigint
    updater: Address
    type: PolicyType
  }>

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip403Registry, 'PolicyCreated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip403Registry,
      'PolicyCreated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a policy is created. */
    onPolicyCreated: (args: Args, log: Log) => void
  }
}

/**
 * Watches for policy admin update events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.policy.watchAdminUpdated(client, {
 *   onAdminUpdated: (args, log) => {
 *     console.log('Policy admin updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchAdminUpdated<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchAdminUpdated.Parameters,
) {
  const { onAdminUpdated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.tip403Registry,
    abi: Abis.tip403Registry,
    eventName: 'PolicyAdminUpdated',
    onLogs: (logs) => {
      for (const log of logs) onAdminUpdated(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchAdminUpdated {
  export type Args = GetEventArgs<
    typeof Abis.tip403Registry,
    'PolicyAdminUpdated',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip403Registry, 'PolicyAdminUpdated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip403Registry,
      'PolicyAdminUpdated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a policy admin is updated. */
    onAdminUpdated: (args: Args, log: Log) => void
  }
}

/**
 * Watches for whitelist update events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.policy.watchWhitelistUpdated(client, {
 *   onWhitelistUpdated: (args, log) => {
 *     console.log('Whitelist updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchWhitelistUpdated<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchWhitelistUpdated.Parameters,
) {
  const { onWhitelistUpdated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.tip403Registry,
    abi: Abis.tip403Registry,
    eventName: 'WhitelistUpdated',
    onLogs: (logs) => {
      for (const log of logs) onWhitelistUpdated(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchWhitelistUpdated {
  export type Args = GetEventArgs<
    typeof Abis.tip403Registry,
    'WhitelistUpdated',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip403Registry, 'WhitelistUpdated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip403Registry,
      'WhitelistUpdated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a whitelist is updated. */
    onWhitelistUpdated: (args: Args, log: Log) => void
  }
}

/**
 * Watches for blacklist update events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.policy.watchBlacklistUpdated(client, {
 *   onBlacklistUpdated: (args, log) => {
 *     console.log('Blacklist updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBlacklistUpdated<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchBlacklistUpdated.Parameters,
) {
  const { onBlacklistUpdated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.tip403Registry,
    abi: Abis.tip403Registry,
    eventName: 'BlacklistUpdated',
    onLogs: (logs) => {
      for (const log of logs) onBlacklistUpdated(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchBlacklistUpdated {
  export type Args = GetEventArgs<
    typeof Abis.tip403Registry,
    'BlacklistUpdated',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip403Registry, 'BlacklistUpdated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip403Registry,
      'BlacklistUpdated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a blacklist is updated. */
    onBlacklistUpdated: (args: Args, log: Log) => void
  }
}
