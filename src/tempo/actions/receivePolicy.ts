import * as AbiEvent from 'ox/AbiEvent'
import * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'
import type * as ReceivePolicyReceipt from 'ox/tempo/ReceivePolicyReceipt'

import * as Account from '../../core/Account.js'
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

/** Reason an inbound transfer or mint was blocked by a receive policy. */
export type BlockedReason = ReceivePolicyReceipt.BlockedReason

/**
 * Burns the funds backing a blocked receipt.
 *
 * Requires the caller to hold the token's `BURN_BLOCKED_ROLE`, and is only
 * valid when the receipt's policy subject is currently unauthorized as a
 * sender under the token's TIP-403 policy.
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
 * const hash = await Actions.receivePolicy.burn(client, {
 *   receipt: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function burn<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burn.Options,
): Promise<burn.ReturnType> {
  return burn.inner(write, client, options)
}

export namespace burn {
  export type Args = {
    /** The encoded claim receipt (witness from a `TransferBlocked` event). */
    receipt: ReceivePolicyReceipt.ReceivePolicyReceipt
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: burn.Options,
  ): Promise<ActionReturnType<action>> {
    const { receipt, ...rest } = options
    return (await action(client, {
      ...rest,
      ...burn.call({ receipt }),
    } as never)) as never
  }

  /**
   * Defines a call to the `burnBlockedReceipt` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { receipt } = args
    return defineCall({
      abi: Abis.receivePolicyGuard,
      address: Addresses.receivePolicyGuard,
      args: [receipt],
      functionName: 'burnBlockedReceipt',
    } as never)
  }

  /** Extracts the `ReceiptBurned` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, logs, {
      eventName: 'ReceiptBurned',
      strict: true,
    })
    if (!log) throw new BaseError('`ReceiptBurned` event not found.')
    return log
  }
}

/**
 * Burns the funds backing a blocked receipt, and waits for the transaction to
 * be confirmed.
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
 * const { receipt, ...event } = await Actions.receivePolicy.burnSync(client, {
 *   receipt: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnSync.Options,
): Promise<burnSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await burn.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace burnSync {
  type Args = burn.Args

  type Options = burn.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** TIP-20 token holding the blocked funds. */
    token: Address.Address
    /** Receiver whose policy blocked the funds. */
    receiver: Address.Address
    /** Guard nonce assigned when the operation was blocked. */
    blockedNonce: bigint
    /** Block timestamp when the operation was blocked. */
    blockedAt: bigint
    /** Receipt layout version. */
    receiptVersion: number
    /** Original sender (transfer) or issuer (mint). */
    originator: Address.Address
    /** Addressed recipient (may be a virtual address). */
    recipient: Address.Address
    /** Recovery authority captured when the operation was blocked. */
    recoveryAuthority: Address.Address
    /** Address that burned the receipt. */
    caller: Address.Address
    /** Burned amount, in base units. */
    amount: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Claims blocked funds for a receipt, releasing them to a destination.
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
 * const hash = await Actions.receivePolicy.claim(client, {
 *   receipt: '0x…',
 *   to: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function claim<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: claim.Options,
): Promise<claim.ReturnType> {
  return claim.inner(write, client, options)
}

export namespace claim {
  export type Args = {
    /** The encoded claim receipt (witness from a `TransferBlocked` event). */
    receipt: ReceivePolicyReceipt.ReceivePolicyReceipt
    /** Destination to release the blocked funds to. */
    to: Address.Address
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: claim.Options,
  ): Promise<ActionReturnType<action>> {
    const { receipt, to, ...rest } = options
    return (await action(client, {
      ...rest,
      ...claim.call({ receipt, to }),
    } as never)) as never
  }

  /**
   * Defines a call to the `claim` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { receipt, to } = args
    return defineCall({
      abi: Abis.receivePolicyGuard,
      address: Addresses.receivePolicyGuard,
      args: [to, receipt],
      functionName: 'claim',
    } as never)
  }

  /** Extracts the `ReceiptClaimed` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, logs, {
      eventName: 'ReceiptClaimed',
      strict: true,
    })
    if (!log) throw new BaseError('`ReceiptClaimed` event not found.')
    return log
  }
}

/**
 * Claimer authorized to reclaim blocked funds.
 *
 * - `'sender'`: the originator of the funds may reclaim them (default).
 * - `'self'`: the account configuring the policy may reclaim them.
 * - `Address.Address`: a delegated third party may reclaim them.
 */
export type Claimer = 'sender' | 'self' | Address.Address

/**
 * Claims blocked funds for a receipt, and waits for the transaction to be
 * confirmed.
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
 * const { receipt, ...event } = await Actions.receivePolicy.claimSync(client, {
 *   receipt: '0x…',
 *   to: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function claimSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: claimSync.Options,
): Promise<claimSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await claim.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = claim.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace claimSync {
  type Args = claim.Args

  type Options = claim.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** TIP-20 token holding the blocked funds. */
    token: Address.Address
    /** Receiver whose policy blocked the funds. */
    receiver: Address.Address
    /** Guard nonce assigned when the operation was blocked. */
    blockedNonce: bigint
    /** Block timestamp when the operation was blocked. */
    blockedAt: bigint
    /** Receipt layout version. */
    receiptVersion: number
    /** Original sender (transfer) or issuer (mint). */
    originator: Address.Address
    /** Addressed recipient (may be a virtual address). */
    recipient: Address.Address
    /** Recovery authority captured when the operation was blocked. */
    recoveryAuthority: Address.Address
    /** Address that claimed the receipt. */
    caller: Address.Address
    /** Address the funds were released to. */
    to: Address.Address
    /** Claimed amount, in base units. */
    amount: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets the receive policy configured for an account.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const policy = await Actions.receivePolicy.get(client, {
 *   account: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The receive policy.
 */
export async function get<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: get.Options = {},
): Promise<get.ReturnType> {
  const { account: account_ = client.account, ...rest } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  const [
    hasReceivePolicy,
    senderPolicyId,
    senderPolicyType,
    tokenPolicyId,
    tokenPolicyType,
    recoveryAuthority,
  ] = (await read(client, {
    ...rest,
    ...get.call({ account: address }),
  } as never)) as read.ReturnType<typeof Abis.tip403Registry, 'receivePolicy'>
  return {
    hasReceivePolicy,
    senderPolicyId: toPolicyRef(senderPolicyId),
    senderPolicyType: policyTypes[senderPolicyType] ?? 'whitelist',
    tokenPolicyId: toPolicyRef(tokenPolicyId),
    tokenPolicyType: policyTypes[tokenPolicyType] ?? 'whitelist',
    claimer: toClaimer(recoveryAuthority, address),
    recoveryAuthority,
  }
}

export namespace get {
  export type Args = {
    /** Account address. */
    account: Address.Address
  }

  export type Options = Omit<ReadParameters, 'account'> & {
    /** Account (or address) to read the receive policy for. @default client.account */
    account?: Account.Account | Address.Address | undefined
  }

  export type ReturnType = {
    /** Whether the account has a receive policy configured. */
    hasReceivePolicy: boolean
    /** TIP-403 policy restricting which senders are allowed. */
    senderPolicyId: PolicyRef
    /** Type of the sender policy. */
    senderPolicyType: PolicyType
    /** TIP-403 policy restricting which tokens are allowed. */
    tokenPolicyId: PolicyRef
    /** Type of the token policy. */
    tokenPolicyType: PolicyType
    /** Who can reclaim funds blocked by this policy. */
    claimer: Claimer
    /** Raw recovery authority address. */
    recoveryAuthority: Address.Address
  }

  export type ErrorType =
    | Account.NotFoundError
    | read.ErrorType
    | Errors.GlobalErrorType

  /**
   * Defines a call to the `receivePolicy` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [account],
      functionName: 'receivePolicy',
    } as never)
  }
}

/**
 * Gets the blocked balance for an encoded receipt.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const amount = await Actions.receivePolicy.getBlockedBalance(client, {
 *   receipt: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The blocked amount for the receipt.
 */
export async function getBlockedBalance<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getBlockedBalance.Options,
): Promise<getBlockedBalance.ReturnType> {
  const { receipt, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getBlockedBalance.call({ receipt }),
  } as never)) as getBlockedBalance.ReturnType
}

export namespace getBlockedBalance {
  export type Args = {
    /** The encoded claim receipt. */
    receipt: ReceivePolicyReceipt.ReceivePolicyReceipt
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.receivePolicyGuard,
    'balanceOf'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `balanceOf` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { receipt } = args
    return defineCall({
      abi: Abis.receivePolicyGuard,
      address: Addresses.receivePolicyGuard,
      args: [receipt],
      functionName: 'balanceOf',
    } as never)
  }
}

/**
 * Reference to a TIP-403 policy.
 *
 * - `'reject-all'`: built-in policy that rejects everything (id `0`).
 * - `'allow-all'`: built-in policy that allows everything (id `1`).
 * - `bigint`: a custom policy id (`>= 2`), e.g. one returned by
 *   `policy.create`.
 */
export type PolicyRef = 'reject-all' | 'allow-all' | bigint

/** TIP-403 policy type. */
export type PolicyType = 'whitelist' | 'blacklist'

/**
 * Sets the receive policy for the calling account.
 *
 * A receive policy controls which TIP-20 tokens and which senders an account
 * accepts. Inbound transfers and mints that violate the policy are not
 * reverted; instead the funds are redirected to the `ReceivePolicyGuard` and
 * can be reclaimed later (see {@link claim}).
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
 * const hash = await Actions.receivePolicy.set(client, {
 *   claimer: 'self',
 *   senderPolicyId: 'allow-all',
 *   tokenPolicyId: 'allow-all',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function set<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: set.Options = {},
): Promise<set.ReturnType> {
  return set.inner(write, client, options)
}

export namespace set {
  export type Args = {
    /** Address of the account configuring the policy. Resolves a `'self'` claimer. */
    account: Address.Address
    /** Who can reclaim funds blocked by this policy. @default 'sender' */
    claimer?: Claimer | undefined
    /** TIP-403 policy restricting which senders are allowed. @default 'allow-all' */
    senderPolicyId?: PolicyRef | undefined
    /** TIP-403 policy restricting which tokens are allowed. @default 'allow-all' */
    tokenPolicyId?: PolicyRef | undefined
  }

  export type Options = WriteParameters & Omit<Args, 'account'>

  export type ReturnType = write.ReturnType

  export type ErrorType =
    | Account.NotFoundError
    | write.ErrorType
    | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: set.Options,
  ): Promise<ActionReturnType<action>> {
    const { claimer, senderPolicyId, tokenPolicyId, ...rest } = options
    const account_ = options.account ?? client.account
    if (!account_) throw new Account.NotFoundError()
    const account = typeof account_ === 'string' ? account_ : account_.address
    return (await action(client, {
      ...rest,
      ...set.call({ account, claimer, senderPolicyId, tokenPolicyId }),
    } as never)) as never
  }

  /**
   * Defines a call to the `setReceivePolicy` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const {
      account,
      claimer = 'sender',
      senderPolicyId = 'allow-all',
      tokenPolicyId = 'allow-all',
    } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [
        resolvePolicyRef(senderPolicyId),
        resolvePolicyRef(tokenPolicyId),
        resolveClaimer(claimer, account),
      ],
      functionName: 'setReceivePolicy',
    } as never)
  }

  /** Extracts the `ReceivePolicyUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'ReceivePolicyUpdated',
      strict: true,
    })
    if (!log) throw new BaseError('`ReceivePolicyUpdated` event not found.')
    return log
  }
}

/**
 * Sets the receive policy for the calling account, and waits for the
 * transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.receivePolicy.setSync(client, {
 *   claimer: 'self',
 *   senderPolicyId: 'allow-all',
 *   tokenPolicyId: 'allow-all',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setSync.Options = {},
): Promise<setSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await set.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { tokenFilterId, ...args } = set.extractEvent(receipt.logs).args
  return {
    ...args,
    senderPolicyId: toPolicyRef(args.senderPolicyId),
    tokenPolicyId: toPolicyRef(tokenFilterId),
    claimer: toClaimer(args.recoveryAuthority, args.account),
    receipt,
  } as never
}

export declare namespace setSync {
  type Args = set.Args

  type Options = set.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Account whose receive policy was updated. */
    account: Address.Address
    /** TIP-403 policy restricting which senders are allowed. */
    senderPolicyId: PolicyRef
    /** TIP-403 policy restricting which tokens are allowed. */
    tokenPolicyId: PolicyRef
    /** Who can reclaim funds blocked by this policy. */
    claimer: Claimer
    /** Raw recovery authority address. */
    recoveryAuthority: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Checks whether a transfer or mint to a receiver is allowed by the receiver's
 * receive policy.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const { authorized, blockedReason } = await Actions.receivePolicy.validate(
 *   client,
 *   { receiver: '0x…', sender: '0x…', token: '0x…' },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the transfer is authorized and, if not, why.
 */
export async function validate<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: validate.Options,
): Promise<validate.ReturnType> {
  const { receiver, sender, token, ...rest } = options
  const [authorized, blockedReason] = (await read(client, {
    ...rest,
    ...validate.call({ receiver, sender, token }),
  } as never)) as read.ReturnType<
    typeof Abis.tip403Registry,
    'validateReceivePolicy'
  >
  return {
    authorized,
    blockedReason: blockedReasons[blockedReason] ?? 'none',
  }
}

export namespace validate {
  export type Args = {
    /** Receiver address. */
    receiver: Address.Address
    /** Sender address. */
    sender: Address.Address
    /** Token address. */
    token: Address.Address
  }

  export type Options = ReadParameters & Args

  export type ReturnType = {
    /** Whether the transfer is authorized. */
    authorized: boolean
    /** Reason the transfer would be blocked. */
    blockedReason: BlockedReason
  }

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `validateReceivePolicy` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { receiver, sender, token } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [token, sender, receiver],
      functionName: 'validateReceivePolicy',
    } as never)
  }
}

/**
 * Watches for blocked transfer events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.receivePolicy.watchBlocked(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchBlocked(
  client: Client.Client,
  options: watchBlocked.Options = {},
): watchBlocked.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.receivePolicyGuard,
    address: Addresses.receivePolicyGuard,
    eventName: 'TransferBlocked',
    strict: true,
  } as never) as watchBlocked.ReturnType
}

export declare namespace watchBlocked {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.receivePolicyGuard,
    'TransferBlocked',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for receipt burned events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.receivePolicy.watchBurned(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchBurned(
  client: Client.Client,
  options: watchBurned.Options = {},
): watchBurned.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.receivePolicyGuard,
    address: Addresses.receivePolicyGuard,
    eventName: 'ReceiptBurned',
    strict: true,
  } as never) as watchBurned.ReturnType
}

export declare namespace watchBurned {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.receivePolicyGuard,
    'ReceiptBurned',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for receipt claimed events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.receivePolicy.watchClaimed(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchClaimed(
  client: Client.Client,
  options: watchClaimed.Options = {},
): watchClaimed.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.receivePolicyGuard,
    address: Addresses.receivePolicyGuard,
    eventName: 'ReceiptClaimed',
    strict: true,
  } as never) as watchClaimed.ReturnType
}

export declare namespace watchClaimed {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.receivePolicyGuard,
    'ReceiptClaimed',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for receive policy update events, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.receivePolicy.watchUpdated(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchUpdated(
  client: Client.Client,
  options: watchUpdated.Options = {},
): watchUpdated.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'ReceivePolicyUpdated',
    strict: true,
  } as never) as watchUpdated.ReturnType
}

export declare namespace watchUpdated {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'ReceivePolicyUpdated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>

/** Built-in TIP-403 policy id that allows everything. @internal */
const allowAllPolicyId = 1n

/** Built-in TIP-403 policy id that rejects everything. @internal */
const rejectAllPolicyId = 0n

/** @internal */
const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'] as const

/** @internal */
const policyTypes = ['whitelist', 'blacklist'] as const

const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Resolves a claimer to its on-chain recovery authority. @internal */
function resolveClaimer(
  claimer: Claimer,
  self: Address.Address,
): Address.Address {
  if (claimer === 'sender') return zeroAddress
  if (claimer === 'self') return self
  return claimer
}

/** Resolves a policy reference to its on-chain id. @internal */
function resolvePolicyRef(ref: PolicyRef): bigint {
  if (ref === 'reject-all') return rejectAllPolicyId
  if (ref === 'allow-all') return allowAllPolicyId
  return ref
}

/** Maps an on-chain recovery authority to a claimer. @internal */
function toClaimer(
  recoveryAuthority: Address.Address,
  account: Address.Address,
): Claimer {
  if (recoveryAuthority === zeroAddress) return 'sender'
  if (Address.isEqual(recoveryAuthority, account)) return 'self'
  return recoveryAuthority
}

/** Maps an on-chain policy id to a policy reference. @internal */
function toPolicyRef(id: bigint): PolicyRef {
  if (id === rejectAllPolicyId) return 'reject-all'
  if (id === allowAllPolicyId) return 'allow-all'
  return id
}
