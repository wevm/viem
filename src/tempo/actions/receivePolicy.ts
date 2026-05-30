import type { Address } from 'abitype'
import type { ReceivePolicyReceipt } from 'ox/tempo'
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
import { zeroAddress } from '../../constants/address.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log, Log as viem_Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { Compute, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../utils/index.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
} from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/** TIP-403 policy type. */
export type PolicyType = 'whitelist' | 'blacklist'

/** @internal */
const policyTypes = ['whitelist', 'blacklist'] as const

/**
 * Reference to a TIP-403 policy.
 *
 * - `'reject-all'` – built-in policy that rejects everything (id `0`).
 * - `'allow-all'` – built-in policy that allows everything (id `1`).
 * - `bigint` – a custom policy id (`>= 2`), e.g. one returned by
 *   {@link policy.create}.
 */
export type PolicyRef = 'reject-all' | 'allow-all' | bigint

/** @internal Built-in TIP-403 policy id that rejects everything. */
const rejectAllPolicyId = 0n
/** @internal Built-in TIP-403 policy id that allows everything. */
const allowAllPolicyId = 1n

/** Reason an inbound transfer or mint was blocked by a receive policy. */
export type BlockedReason = ReceivePolicyReceipt.BlockedReason

/** @internal */
const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'] as const

/**
 * Claimer authorized to reclaim blocked funds.
 *
 * - `'sender'` – the originator of the funds may reclaim them (default).
 * - `'self'` – the account configuring the policy may reclaim them.
 * - `Address` – a delegated third party may reclaim them.
 */
export type Claimer = 'sender' | 'self' | Address

/**
 * Burns the funds backing a blocked receipt.
 *
 * Requires the caller to hold the token's `BURN_BLOCKED_ROLE`, and is only
 * valid when the receipt's policy subject is currently unauthorized as a sender
 * under the token's TIP-403 policy.
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
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.receivePolicy.burn(client, {
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function burn<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: burn.Parameters<chain, account>,
): Promise<burn.ReturnValue> {
  return burn.inner(writeContract, client, parameters)
}

export namespace burn {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The encoded claim receipt (witness from a `TransferBlocked` event). */
    receipt: Hex
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
      receipt,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = burn.call({ receipt })
    return action(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `burnBlockedReceipt` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { receipt } = args
    return defineCall({
      address: Addresses.receivePolicyGuard,
      abi: Abis.receivePolicyGuard,
      functionName: 'burnBlockedReceipt',
      args: [receipt],
    })
  }

  /**
   * Extracts the `ReceiptBurned` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ReceiptBurned` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.receivePolicyGuard,
      logs,
      eventName: 'ReceiptBurned',
      strict: true,
    })
    if (!log) throw new Error('`ReceiptBurned` event not found.')
    return log
  }
}

/**
 * Burns the funds backing a blocked receipt and waits for the receipt.
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
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.receivePolicy.burnSync(client, {
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function burnSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: burnSync.Parameters<chain, account>,
): Promise<burnSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await burn.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = burn.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace burnSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = burn.Parameters<chain, account>

  export type Args = burn.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.receivePolicyGuard,
      'ReceiptBurned',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Claims blocked funds for a receipt, releasing them to a destination.
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
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.receivePolicy.claim(client, {
 *   to: '0x...',
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function claim<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: claim.Parameters<chain, account>,
): Promise<claim.ReturnValue> {
  return claim.inner(writeContract, client, parameters)
}

export namespace claim {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Destination to release the blocked funds to. */
    to: Address
    /** The encoded claim receipt (witness from a `TransferBlocked` event). */
    receipt: Hex
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
      to,
      receipt,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = claim.call({ to, receipt })
    return action(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `claim` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { to, receipt } = args
    return defineCall({
      address: Addresses.receivePolicyGuard,
      abi: Abis.receivePolicyGuard,
      functionName: 'claim',
      args: [to, receipt],
    })
  }

  /**
   * Extracts the `ReceiptClaimed` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ReceiptClaimed` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.receivePolicyGuard,
      logs,
      eventName: 'ReceiptClaimed',
      strict: true,
    })
    if (!log) throw new Error('`ReceiptClaimed` event not found.')
    return log
  }
}

/**
 * Claims blocked funds for a receipt and waits for the receipt.
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
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.receivePolicy.claimSync(client, {
 *   to: '0x...',
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function claimSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: claimSync.Parameters<chain, account>,
): Promise<claimSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await claim.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = claim.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace claimSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = claim.Parameters<chain, account>

  export type Args = claim.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.receivePolicyGuard,
      'ReceiptClaimed',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the receive policy configured for an account.
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
 * const policy = await Actions.receivePolicy.get(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The receive policy.
 */
export async function get<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: get.Parameters<account>,
): Promise<get.ReturnValue> {
  const { account: account_ = client.account, ...rest } = parameters
  if (!account_) throw new Error('`account` is required.')
  const account = parseAccount(account_)
  const [
    hasReceivePolicy,
    senderPolicyId,
    senderPolicyType,
    tokenPolicyId,
    tokenPolicyType,
    recoveryAuthority,
  ] = await readContract(client, {
    ...rest,
    account: null as never,
    ...get.call({ account: account.address }),
  })
  return {
    hasReceivePolicy,
    senderPolicyId: toPolicyRef(senderPolicyId),
    senderPolicyType: policyTypes[senderPolicyType] ?? 'whitelist',
    tokenPolicyId: toPolicyRef(tokenPolicyId),
    tokenPolicyType: policyTypes[tokenPolicyType] ?? 'whitelist',
    claimer: toClaimer(recoveryAuthority, account.address),
    recoveryAuthority,
  }
}

export namespace get {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters & GetAccountParameter<account>

  export type Args = {
    /** Account address. */
    account: Address
  }

  export type ReturnValue = Compute<{
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
    recoveryAuthority: Address
  }>

  /**
   * Defines a call to the `receivePolicy` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      functionName: 'receivePolicy',
      args: [account],
    })
  }
}

/**
 * Gets the blocked balance for an encoded receipt.
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
 * const amount = await Actions.receivePolicy.getBlockedBalance(client, {
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The blocked amount for the receipt.
 */
export async function getBlockedBalance<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getBlockedBalance.Parameters,
): Promise<getBlockedBalance.ReturnValue> {
  const { receipt, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getBlockedBalance.call({ receipt }),
  })
}

export namespace getBlockedBalance {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** The encoded claim receipt. */
    receipt: Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.receivePolicyGuard,
    'balanceOf',
    never
  >

  /**
   * Defines a call to the `balanceOf` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { receipt } = args
    return defineCall({
      address: Addresses.receivePolicyGuard,
      abi: Abis.receivePolicyGuard,
      functionName: 'balanceOf',
      args: [receipt],
    })
  }
}

/**
 * Sets the receive policy for the calling account.
 *
 * A receive policy controls which TIP-20 tokens and which senders an account
 * accepts. Inbound transfers and mints that violate the policy are not
 * reverted – instead the funds are redirected to the `ReceivePolicyGuard` and
 * can be reclaimed later (see {@link claim}).
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
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.receivePolicy.set(client, {
 *   senderPolicyId: 'allow-all',
 *   tokenPolicyId: 'allow-all',
 *   claimer: 'self',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function set<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: set.Parameters<chain, account>,
): Promise<set.ReturnValue> {
  return set.inner(writeContract, client, parameters)
}

export namespace set {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Omit<Args, 'recoveryAuthority'>

  export type Args = {
    /**
     * TIP-403 policy restricting which senders are allowed.
     * @default 'allow-all'
     */
    senderPolicyId?: PolicyRef | undefined
    /**
     * TIP-403 policy restricting which tokens are allowed.
     * @default 'allow-all'
     */
    tokenPolicyId?: PolicyRef | undefined
    /**
     * Who can reclaim funds blocked by this policy.
     * @default 'sender'
     */
    claimer?: Claimer | undefined
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
      senderPolicyId = 'allow-all',
      tokenPolicyId = 'allow-all',
      claimer = 'sender',
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const address = parseAccount(account).address
    const recoveryAuthority = resolveClaimer(claimer, address)

    const call = set.call({
      senderPolicyId: resolvePolicyRef(senderPolicyId),
      tokenFilterId: resolvePolicyRef(tokenPolicyId),
      recoveryAuthority,
    })
    return action(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `setReceivePolicy` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: {
    /** Resolved TIP-403 sender policy id. */
    senderPolicyId: bigint
    /** Resolved TIP-403 token filter id. */
    tokenFilterId: bigint
    /** Resolved recovery authority. */
    recoveryAuthority: Address
  }) {
    const { senderPolicyId, tokenFilterId, recoveryAuthority } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      functionName: 'setReceivePolicy',
      args: [senderPolicyId, tokenFilterId, recoveryAuthority],
    })
  }

  /**
   * Extracts the `ReceivePolicyUpdated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ReceivePolicyUpdated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip403Registry,
      logs,
      eventName: 'ReceivePolicyUpdated',
      strict: true,
    })
    if (!log) throw new Error('`ReceivePolicyUpdated` event not found.')
    return log
  }
}

/**
 * Sets the receive policy for the calling account and waits for the receipt.
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
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.receivePolicy.setSync(client, {
 *   senderPolicyId: 'allow-all',
 *   tokenPolicyId: 'allow-all',
 *   claimer: 'self',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setSync.Parameters<chain, account>,
): Promise<setSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await set.inner(writeContractSync, client, {
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

export namespace setSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = set.Parameters<chain, account>

  export type Args = set.Args

  export type ReturnValue = Compute<
    UnionOmit<
      GetEventArgs<
        typeof Abis.tip403Registry,
        'ReceivePolicyUpdated',
        { IndexedOnly: false; Required: true }
      >,
      'senderPolicyId' | 'tokenFilterId'
    > & {
      /** TIP-403 policy restricting which senders are allowed. */
      senderPolicyId: PolicyRef
      /** TIP-403 policy restricting which tokens are allowed. */
      tokenPolicyId: PolicyRef
      /** Who can reclaim funds blocked by this policy. */
      claimer: Claimer
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Checks whether a transfer or mint to a receiver is allowed by the receiver's
 * receive policy.
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
 * const { authorized, blockedReason } = await Actions.receivePolicy.validate(
 *   client,
 *   {
 *     token: '0x...',
 *     sender: '0x...',
 *     receiver: '0x...',
 *   },
 * )
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the transfer is authorized and, if not, why.
 */
export async function validate<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: validate.Parameters,
): Promise<validate.ReturnValue> {
  const { token, sender, receiver, ...rest } = parameters
  const [authorized, blockedReason] = await readContract(client, {
    ...rest,
    ...validate.call({ token, sender, receiver }),
  })
  return {
    authorized,
    blockedReason: blockedReasons[blockedReason] ?? 'none',
  }
}

export namespace validate {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Token address. */
    token: Address
    /** Sender address. */
    sender: Address
    /** Receiver address. */
    receiver: Address
  }

  export type ReturnValue = Compute<{
    /** Whether the transfer is authorized. */
    authorized: boolean
    /** Reason the transfer would be blocked. */
    blockedReason: BlockedReason
  }>

  /**
   * Defines a call to the `validateReceivePolicy` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, sender, receiver } = args
    return defineCall({
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
      functionName: 'validateReceivePolicy',
      args: [token, sender, receiver],
    })
  }
}

/**
 * Watches for blocked transfer events.
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
 * const unwatch = Actions.receivePolicy.watchBlocked(client, {
 *   onBlocked: (args, log) => {
 *     console.log('Transfer blocked:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBlocked<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchBlocked.Parameters,
) {
  const { onBlocked, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.receivePolicyGuard,
    abi: Abis.receivePolicyGuard,
    eventName: 'TransferBlocked',
    onLogs: (logs) => {
      for (const log of logs) {
        const { receipt, ...args } = log.args
        onBlocked({ ...args, claimReceipt: receipt }, log)
      }
    },
    strict: true,
  })
}

export declare namespace watchBlocked {
  export type Args = Compute<
    UnionOmit<
      GetEventArgs<
        typeof Abis.receivePolicyGuard,
        'TransferBlocked',
        { IndexedOnly: false; Required: true }
      >,
      'receipt'
    > & {
      /** The encoded claim receipt (witness for `claim`/`burn`). */
      claimReceipt: Hex
    }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.receivePolicyGuard, 'TransferBlocked'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.receivePolicyGuard,
      'TransferBlocked',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a transfer is blocked. */
    onBlocked: (args: Args, log: Log) => void
  }
}

/**
 * Watches for receipt burned events.
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
 * const unwatch = Actions.receivePolicy.watchBurned(client, {
 *   onBurned: (args, log) => {
 *     console.log('Receipt burned:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBurned<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchBurned.Parameters,
) {
  const { onBurned, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.receivePolicyGuard,
    abi: Abis.receivePolicyGuard,
    eventName: 'ReceiptBurned',
    onLogs: (logs) => {
      for (const log of logs) onBurned(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchBurned {
  export type Args = Compute<
    GetEventArgs<
      typeof Abis.receivePolicyGuard,
      'ReceiptBurned',
      { IndexedOnly: false; Required: true }
    >
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.receivePolicyGuard, 'ReceiptBurned'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.receivePolicyGuard,
      'ReceiptBurned',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a receipt is burned. */
    onBurned: (args: Args, log: Log) => void
  }
}

/**
 * Watches for receipt claimed events.
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
 * const unwatch = Actions.receivePolicy.watchClaimed(client, {
 *   onClaimed: (args, log) => {
 *     console.log('Receipt claimed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchClaimed<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchClaimed.Parameters,
) {
  const { onClaimed, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.receivePolicyGuard,
    abi: Abis.receivePolicyGuard,
    eventName: 'ReceiptClaimed',
    onLogs: (logs) => {
      for (const log of logs) onClaimed(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchClaimed {
  export type Args = Compute<
    GetEventArgs<
      typeof Abis.receivePolicyGuard,
      'ReceiptClaimed',
      { IndexedOnly: false; Required: true }
    >
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.receivePolicyGuard, 'ReceiptClaimed'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.receivePolicyGuard,
      'ReceiptClaimed',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a receipt is claimed. */
    onClaimed: (args: Args, log: Log) => void
  }
}

/**
 * Watches for receive policy update events.
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
 * const unwatch = Actions.receivePolicy.watchUpdated(client, {
 *   onUpdated: (args, log) => {
 *     console.log('Receive policy updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchUpdated<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchUpdated.Parameters,
) {
  const { onUpdated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.tip403Registry,
    abi: Abis.tip403Registry,
    eventName: 'ReceivePolicyUpdated',
    onLogs: (logs) => {
      for (const log of logs) {
        const { tokenFilterId, ...args } = log.args
        onUpdated(
          {
            ...args,
            senderPolicyId: toPolicyRef(args.senderPolicyId),
            tokenPolicyId: toPolicyRef(tokenFilterId),
            claimer: toClaimer(args.recoveryAuthority, args.account),
          },
          log,
        )
      }
    },
    strict: true,
  })
}

export declare namespace watchUpdated {
  export type Args = Compute<
    UnionOmit<
      GetEventArgs<
        typeof Abis.tip403Registry,
        'ReceivePolicyUpdated',
        { IndexedOnly: false; Required: true }
      >,
      'senderPolicyId' | 'tokenFilterId'
    > & {
      /** TIP-403 policy restricting which senders are allowed. */
      senderPolicyId: PolicyRef
      /** TIP-403 policy restricting which tokens are allowed. */
      tokenPolicyId: PolicyRef
      /** Who can reclaim funds blocked by this policy. */
      claimer: Claimer
    }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip403Registry, 'ReceivePolicyUpdated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip403Registry,
      'ReceivePolicyUpdated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a receive policy is updated. */
    onUpdated: (args: Args, log: Log) => void
  }
}

/** @internal */
function resolvePolicyRef(ref: PolicyRef): bigint {
  if (ref === 'reject-all') return rejectAllPolicyId
  if (ref === 'allow-all') return allowAllPolicyId
  return ref
}

/** @internal */
function toPolicyRef(id: bigint): PolicyRef {
  if (id === rejectAllPolicyId) return 'reject-all'
  if (id === allowAllPolicyId) return 'allow-all'
  return id
}

/** @internal */
function resolveClaimer(claimer: Claimer, self: Address): Address {
  if (claimer === 'sender') return zeroAddress
  if (claimer === 'self') return self
  return claimer
}

/** @internal */
function toClaimer(recoveryAuthority: Address, account: Address): Claimer {
  if (recoveryAuthority === zeroAddress) return 'sender'
  if (isAddressEqual(recoveryAuthority, account)) return 'self'
  return recoveryAuthority
}
