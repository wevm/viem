import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type {
  WatchContractEventParameters,
  WatchContractEventReturnType,
} from '../../actions/public/watchContractEvent.js'
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
import type { UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Claims accumulated rewards for a recipient.
 *
 * This function allows a reward recipient to claim their accumulated rewards
 * and receive them as token transfers to their own balance.
 *
 * - Accrues all pending rewards up to the current block timestamp.
 * - Updates the caller's reward accounting.
 * - Transfers the caller's accumulated `rewardBalance` from the token contract to the caller.
 * - If the contract's balance is insufficient, claims up to the available amount.
 * - Returns the actual amount claimed.
 *
 * Notes:
 * - Reverts with `Paused` if the token is paused.
 * - Reverts with `PolicyForbids` if the caller is not authorized to receive tokens under TIP-403.
 * - If opted in, the claimed amount is added back to `optedInSupply` since it goes to the recipient's balance.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.reward.claim(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
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
  export type Args = {
    /** The TIP20 token address */
    token: Address
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

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
    const { token, ...rest } = parameters
    const call = claim.call({ token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `claimRewards` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const hash = await client.sendTransaction({
   *   calls: [actions.reward.claim.call({
   *     token: '0x20c0000000000000000000000000000000000001',
   *   })],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      address: token,
      abi: Abis.tip20,
      args: [],
      functionName: 'claimRewards',
    })
  }
}

/**
 * Claims accumulated rewards for a recipient and waits for confirmation.
 *
 * This function allows a reward recipient to claim their accumulated rewards
 * and receive them as token transfers to their own balance.
 *
 * Behavior:
 * - Accrues all pending rewards up to the current block timestamp.
 * - Updates the caller's reward accounting.
 * - Transfers the caller's accumulated `rewardBalance` from the token contract to the caller.
 * - If the contract's balance is insufficient, claims up to the available amount.
 *
 * Notes:
 * - Reverts with `Paused` if the token is paused.
 * - Reverts with `PolicyForbids` if the caller is not authorized to receive tokens under TIP-403.
 * - If opted in, the claimed amount is added back to `optedInSupply` since it goes to the recipient's balance.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.reward.claimSync(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The amount claimed and transaction receipt.
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
  return {
    receipt,
  } as never
}

export namespace claimSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & claim.Args

  export type ReturnValue = {
    /** The transaction receipt */
    receipt: Awaited<ReturnType<typeof writeContractSync>>
  }

  export type ErrorType = claim.ErrorType
}

/**
 * Distributes rewards to opted-in token holders.
 *
 * This function transfers `amount` of tokens from the caller into the token contract's
 * reward pool and immediately distributes them to current opted-in holders by increasing
 * `globalRewardPerToken`.
 *
 * Notes:
 * - Reverts with `InvalidAmount` if `amount == 0`.
 * - The transfer from caller to pool is subject to TIP-403 policy checks.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.reward.distribute(client, {
 *   amount: 100000000000000000000n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function distribute<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: distribute.Parameters<chain, account>,
): Promise<distribute.ReturnValue> {
  return distribute.inner(writeContract, client, parameters)
}

/**
 * Distributes rewards to opted-in token holders and waits for confirmation.
 *
 * This function transfers `amount` of tokens from the caller into the token contract's
 * reward pool and immediately distributes them to current opted-in holders by increasing
 * `globalRewardPerToken`.
 *
 * Notes:
 * - Reverts with `InvalidAmount` if `amount == 0`.
 * - The transfer from caller to pool is subject to TIP-403 policy checks.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { amount, funder, receipt } = await Actions.reward.distributeSync(client, {
 *   amount: 100000000000000000000n,
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The funder, amount, and transaction receipt.
 */
export async function distributeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: distributeSync.Parameters<chain, account>,
): Promise<distributeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await distribute.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = distribute.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace distribute {
  export type Args = {
    /** The amount of tokens to distribute (must be > 0) */
    amount: bigint
    /** The TIP20 token address */
    token: Address
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

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
    const { amount, token, ...rest } = parameters
    const call = distribute.call({ amount, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `distributeReward` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const hash = await client.sendTransaction({
   *   calls: [actions.reward.distribute.call({
   *     amount: 100000000000000000000n,
   *     token: '0x20c0000000000000000000000000000000000001',
   *   })],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { amount, token } = args
    return defineCall({
      address: token,
      abi: Abis.tip20,
      args: [amount],
      functionName: 'distributeReward',
    })
  }

  /**
   * Extracts the `RewardDistributed` event from logs.
   *
   * @param logs - The logs.
   * @returns The `RewardDistributed` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'RewardDistributed',
      strict: true,
    })
    if (!log) throw new Error('`RewardDistributed` event not found.')
    return log
  }
}

export declare namespace distributeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & distribute.Args

  export type ReturnValue = {
    /** The amount distributed */
    amount: bigint
    /** The address that funded the distribution */
    funder: Address
    /** The transaction receipt */
    receipt: Awaited<ReturnType<typeof writeContractSync>>
  }

  export type ErrorType = distribute.ErrorType
}

/**
 * Gets the global reward per token value.
 *
 * Returns the current global reward per token value scaled by `ACC_PRECISION` (1e18).
 * This value increases each time rewards are distributed.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const rewardPerToken = await Actions.reward.getGlobalRewardPerToken(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The global reward per token (scaled by 1e18).
 */
export async function getGlobalRewardPerToken<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getGlobalRewardPerToken.Parameters,
): Promise<getGlobalRewardPerToken.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getGlobalRewardPerToken.call(parameters),
  })
}

export namespace getGlobalRewardPerToken {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** The TIP20 token address */
    token: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
    'globalRewardPerToken',
    never
  >

  /**
   * Defines a call to the `globalRewardPerToken` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      address: token,
      abi: Abis.tip20,
      args: [],
      functionName: 'globalRewardPerToken',
    })
  }
}

/**
 * Calculates the pending claimable rewards for an account without modifying state.
 *
 * Returns the total pending claimable reward amount, including stored balance and newly accrued rewards.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const pending = await Actions.reward.getPendingRewards(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The total pending claimable reward amount.
 */
export async function getPendingRewards<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getPendingRewards.Parameters,
): Promise<getPendingRewards.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getPendingRewards.call(parameters),
  })
}

export namespace getPendingRewards {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** The account address to query pending rewards for */
    account: Address
    /** The TIP20 token address */
    token: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
    'getPendingRewards',
    never
  >

  /**
   * Defines a call to the `getPendingRewards` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, token } = args
    return defineCall({
      address: token,
      abi: Abis.tip20,
      args: [account],
      functionName: 'getPendingRewards',
    })
  }
}

/**
 * Gets the reward information for a specific account.
 *
 * Returns the reward recipient address, reward per token value, and accumulated reward balance for the specified account.
 * This information includes:
 * - `rewardRecipient`: The address designated to receive rewards (zero address if opted out)
 * - `rewardPerToken`: The reward per token value for this account
 * - `rewardBalance`: The accumulated reward balance waiting to be claimed
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const info = await Actions.reward.getUserRewardInfo(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The user's reward information (recipient, rewardPerToken, rewardBalance).
 */
export async function getUserRewardInfo<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getUserRewardInfo.Parameters,
): Promise<getUserRewardInfo.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getUserRewardInfo.call(parameters),
  })
}

export namespace getUserRewardInfo {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** The account address to query reward info for */
    account: Address
    /** The TIP20 token address */
    token: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
    'userRewardInfo',
    never
  >

  /**
   * Defines a call to the `userRewardInfo` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, token } = args
    return defineCall({
      address: token,
      abi: Abis.tip20,
      args: [account],
      functionName: 'userRewardInfo',
    })
  }
}

/**
 * Sets or changes the reward recipient for a token holder.
 *
 * This function allows a token holder to designate who should receive their share of rewards:
 * - If `recipient` is the zero address, opts out from rewards distribution.
 * - Otherwise, opts in and sets `recipient` as the address that will receive accrued rewards.
 * - Can be called with `recipient == msg.sender` to receive rewards directly.
 * - Automatically distributes any accrued rewards to the current recipient before changing.
 *
 * TIP-403 Policy:
 * - Reverts with `PolicyForbids` if `recipient` is not the zero address and either the holder or recipient is not authorized to receive tokens under the token's transfer policy.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.reward.setRecipient(client, {
 *   recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setRecipient<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setRecipient.Parameters<chain, account>,
): Promise<setRecipient.ReturnValue> {
  return setRecipient.inner(writeContract, client, parameters)
}

/**
 * Sets or changes the reward recipient for a token holder and waits for confirmation.
 *
 * This function allows a token holder to designate who should receive their share of rewards:
 * - If `recipient` is the zero address, opts out from rewards distribution.
 * - Otherwise, opts in and sets `recipient` as the address that will receive accrued rewards.
 * - Can be called with `recipient == msg.sender` to receive rewards directly.
 * - Automatically distributes any accrued rewards to the current recipient before changing.
 *
 * TIP-403 Policy:
 * - Reverts with `PolicyForbids` if `recipient` is not the zero address and either the holder or recipient is not authorized to receive tokens under the token's transfer policy.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { holder, recipient, receipt } = await Actions.reward.setRecipientSync(client, {
 *   recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The holder, recipient, and transaction receipt.
 */
export async function setRecipientSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setRecipientSync.Parameters<chain, account>,
): Promise<setRecipientSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setRecipient.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setRecipient.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace setRecipient {
  export type Args = {
    /** The reward recipient address (use zero address to opt out of rewards) */
    recipient: Address
    /** The TIP20 token address */
    token: Address
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

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
    const { recipient, token, ...rest } = parameters
    const call = setRecipient.call({ recipient, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `setRewardRecipient` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const hash = await client.sendTransaction({
   *   calls: [actions.reward.setRecipient.call({
   *     recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
   *     token: '0x20c0000000000000000000000000000000000001',
   *   })],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { recipient, token } = args
    return defineCall({
      address: token,
      abi: Abis.tip20,
      args: [recipient],
      functionName: 'setRewardRecipient',
    })
  }

  /**
   * Extracts the `RewardRecipientSet` event from logs.
   *
   * @param logs - The logs.
   * @returns The `RewardRecipientSet` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'RewardRecipientSet',
      strict: true,
    })
    if (!log) throw new Error('`RewardRecipientSet` event not found.')
    return log
  }
}

export declare namespace setRecipientSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & setRecipient.Args

  export type ReturnValue = {
    /** The token holder address who set their reward recipient */
    holder: Address
    /** The transaction receipt */
    receipt: Awaited<ReturnType<typeof writeContractSync>>
    /** The reward recipient address (zero address indicates opt-out) */
    recipient: Address
  }

  export type ErrorType = setRecipient.ErrorType
}

/**
 * Watches for reward distributed events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.reward.watchRewardDistributed(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   onRewardDistributed: (args, log) => {
 *     console.log('Reward distributed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchRewardDistributed<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchRewardDistributed.Parameters,
) {
  const { onRewardDistributed, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: token,
    abi: Abis.tip20,
    eventName: 'RewardDistributed',
    onLogs: (logs) => {
      for (const log of logs) onRewardDistributed(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchRewardDistributed {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'RewardDistributed',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'RewardDistributed'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'RewardDistributed', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when rewards are distributed. */
    onRewardDistributed: (args: Args, log: Log) => void
    /** The TIP20 token address */
    token: Address
  }

  export type ReturnValue = WatchContractEventReturnType
}

/**
 * Watches for reward recipient set events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.reward.watchRewardRecipientSet(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 *   onRewardRecipientSet: (args, log) => {
 *     console.log('Reward recipient set:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchRewardRecipientSet<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchRewardRecipientSet.Parameters,
) {
  const { onRewardRecipientSet, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: token,
    abi: Abis.tip20,
    eventName: 'RewardRecipientSet',
    onLogs: (logs) => {
      for (const log of logs) onRewardRecipientSet(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchRewardRecipientSet {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'RewardRecipientSet',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'RewardRecipientSet'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'RewardRecipientSet', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a reward recipient is set. */
    onRewardRecipientSet: (args: Args, log: Log) => void
    /** The TIP20 token address */
    token: Address
  }

  export type ReturnValue = WatchContractEventReturnType
}
