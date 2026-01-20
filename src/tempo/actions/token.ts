import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import { TokenId, TokenRole } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { multicall } from '../../actions/public/multicall.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type {
  WatchContractEventParameters,
  WatchContractEventReturnType,
} from '../../actions/public/watchContractEvent.js'
import { watchContractEvent } from '../../actions/public/watchContractEvent.js'
import { sendTransaction } from '../../actions/wallet/sendTransaction.js'
import {
  type SendTransactionSyncParameters,
  sendTransactionSync,
} from '../../actions/wallet/sendTransactionSync.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log, Log as viem_Log } from '../../types/log.js'
import type { Compute, OneOf, UnionOmit } from '../../types/utils.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
} from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Approves a spender to transfer TIP20 tokens on behalf of the caller.
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
 * const result = await Actions.token.approve(client, {
 *   spender: '0x...',
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function approve<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: approve.Parameters<chain, account>,
): Promise<approve.ReturnValue> {
  const { token, ...rest } = parameters
  return approve.inner(writeContract, client, parameters, { ...rest, token })
}

export namespace approve {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokens to approve. */
    amount: bigint
    /** Address of the spender. */
    spender: Address
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: approve.Parameters<chain, account>,
    args: Args,
  ): Promise<ReturnType<action>> {
    const call = approve.call(args)
    return (await action(client, {
      ...parameters,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `approve` function.
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
   *     actions.token.approve.call({
   *       spender: '0x20c0...beef',
   *       amount: 100n,
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { spender, amount, token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'Approval',
    })
    if (!log) throw new Error('`Approval` event not found.')
    return log
  }
}

/**
 * Approves a spender to transfer TIP20 tokens on behalf of the caller.
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
 * const result = await Actions.token.approveSync(client, {
 *   spender: '0x...',
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function approveSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: approveSync.Parameters<chain, account>,
): Promise<approveSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await approve.inner(
    writeContractSync,
    client,
    { ...parameters, throwOnReceiptRevert } as never,
    rest,
  )
  const { args } = approve.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace approveSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = approve.Parameters<chain, account>

  export type Args = approve.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20,
      'Approval',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Burns TIP20 tokens from a blocked address.
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
 * const result = await Actions.token.burnBlocked(client, {
 *   from: '0x...',
 *   amount: 100n,
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function burnBlocked<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: burnBlocked.Parameters<chain, account>,
): Promise<burnBlocked.ReturnValue> {
  return burnBlocked.inner(writeContract, client, parameters)
}

export namespace burnBlocked {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokens to burn. */
    amount: bigint
    /** Address to burn tokens from. */
    from: Address
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: burnBlocked.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { amount, from, token, ...rest } = parameters
    const call = burnBlocked.call({ amount, from, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `burnBlocked` function.
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
   *     actions.token.burnBlocked.call({
   *       from: '0x20c0...beef',
   *       amount: 100n,
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { from, amount, token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'burnBlocked',
      args: [from, amount],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'BurnBlocked',
    })
    if (!log) throw new Error('`BurnBlocked` event not found.')
    return log
  }
}

/**
 * Burns TIP20 tokens from a blocked address.
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
 * const result = await Actions.token.burnBlockedSync(client, {
 *   from: '0x...',
 *   amount: 100n,
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function burnBlockedSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: burnBlockedSync.Parameters<chain, account>,
): Promise<burnBlockedSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await burnBlocked.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = burnBlocked.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace burnBlockedSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = burnBlocked.Parameters<chain, account>

  export type Args = burnBlocked.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20,
      'BurnBlocked',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Burns TIP20 tokens from the caller's balance.
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
 * const result = await Actions.token.burn(client, {
 *   amount: 100n,
 *   token: '0x...',
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
    /** Amount of tokens to burn. */
    amount: bigint
    /** Memo to include in the transfer. */
    memo?: Hex.Hex | undefined
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: burn.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { amount, memo, token, ...rest } = parameters
    const call = burn.call({ amount, memo, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `burn` or `burnWithMemo` function.
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
   *     actions.token.burn.call({
   *       amount: 100n,
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { amount, memo, token } = args
    const callArgs = memo
      ? ({
          functionName: 'burnWithMemo',
          args: [amount, Hex.padLeft(memo, 32)],
        } as const)
      : ({
          functionName: 'burn',
          args: [amount],
        } as const)
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      ...callArgs,
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'Burn',
    })
    if (!log) throw new Error('`Burn` event not found.')
    return log
  }
}

/**
 * Burns TIP20 tokens from the caller's balance.
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
 * const result = await Actions.token.burnSync(client, {
 *   amount: 100n,
 *   token: '0x...',
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
      typeof Abis.tip20,
      'Burn',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Changes the transfer policy ID for a TIP20 token.
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
 * const result = await Actions.token.changeTransferPolicy(client, {
 *   token: '0x...',
 *   policyId: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function changeTransferPolicy<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeTransferPolicy.Parameters<chain, account>,
): Promise<changeTransferPolicy.ReturnValue> {
  return changeTransferPolicy.inner(writeContract, client, parameters)
}

export namespace changeTransferPolicy {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** New transfer policy ID. */
    policyId: bigint
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: changeTransferPolicy.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { policyId, token, ...rest } = parameters
    const call = changeTransferPolicy.call({ policyId, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `changeTransferPolicyId` function.
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
   *     actions.token.changeTransferPolicy.call({
   *       token: '0x20c0...babe',
   *       policyId: 1n,
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, policyId } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'changeTransferPolicyId',
      args: [policyId],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'TransferPolicyUpdate',
    })
    if (!log) throw new Error('`TransferPolicyUpdate` event not found.')
    return log
  }
}

/**
 * Changes the transfer policy ID for a TIP20 token.
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
 * const result = await Actions.token.changeTransferPolicySync(client, {
 *   token: '0x...',
 *   policyId: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function changeTransferPolicySync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeTransferPolicySync.Parameters<chain, account>,
): Promise<changeTransferPolicySync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await changeTransferPolicy.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = changeTransferPolicy.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace changeTransferPolicySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = changeTransferPolicy.Parameters<chain, account>

  export type Args = changeTransferPolicy.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20,
      'TransferPolicyUpdate',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Creates a new TIP20 token.
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
 * const result = await Actions.token.create(client, {
 *   name: 'My Token',
 *   symbol: 'MTK',
 *   currency: 'USD',
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
    Omit<Args, 'admin'> &
    (account extends Account
      ? { admin?: Account | Address | undefined }
      : { admin: Account | Address })

  export type Args = {
    /** Admin address. */
    admin: Address
    /** Currency (e.g. "USD"). */
    currency: string
    /** Token name. */
    name: string
    /** Quote token. */
    quoteToken?: TokenId.TokenIdOrAddress | undefined
    /** Unique salt. @default Hex.random(32) */
    salt?: Hex.Hex | undefined
    /** Token symbol. */
    symbol: string
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
    parameters: any,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      admin: admin_ = client.account,
      chain = client.chain,
      ...rest
    } = parameters
    const admin = admin_ ? parseAccount(admin_) : undefined
    if (!admin) throw new Error('admin is required.')

    const call = create.call({ ...rest, admin: admin.address })

    return (await action(
      client as never,
      {
        ...parameters,
        account,
        chain,
        ...call,
      } as never,
    )) as never
  }

  /**
   * Defines a call to the `createToken` function.
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
   *     actions.token.create.call({
   *       name: 'My Token',
   *       symbol: 'MTK',
   *       currency: 'USD',
   *       admin: '0xfeed...fede',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const {
      name,
      symbol,
      currency,
      quoteToken = Addresses.pathUsd,
      admin,
      salt = Hex.random(32),
    } = args
    return defineCall({
      address: Addresses.tip20Factory,
      abi: Abis.tip20Factory,
      args: [
        name,
        symbol,
        currency,
        TokenId.toAddress(quoteToken),
        admin,
        salt,
      ],
      functionName: 'createToken',
    })
  }

  /**
   * Extracts the `TokenCreated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `TokenCreated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20Factory,
      logs,
      eventName: 'TokenCreated',
      strict: true,
    })
    if (!log) throw new Error('`TokenCreated` event not found.')
    return log
  }
}

/**
 * Creates a new TIP20 token.
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
 * const result = await Actions.token.createSync(client, {
 *   name: 'My Token',
 *   symbol: 'MTK',
 *   currency: 'USD',
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
  const tokenId = TokenId.fromAddress(args.token)

  return {
    ...args,
    receipt,
    tokenId,
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
      typeof Abis.tip20Factory,
      'TokenCreated',
      { IndexedOnly: false; Required: true }
    > & {
      /** Token ID. */
      tokenId: TokenId.TokenId
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets TIP20 token allowance.
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
 * const allowance = await Actions.token.getAllowance(client, {
 *   spender: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token allowance.
 */
export async function getAllowance<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getAllowance.Parameters<account>,
): Promise<getAllowance.ReturnValue> {
  const { account = client.account } = parameters
  const address = account ? parseAccount(account).address : undefined
  if (!address) throw new Error('account is required.')
  return readContract(client, {
    ...parameters,
    ...getAllowance.call({ ...parameters, account: address }),
  })
}

export namespace getAllowance {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters & GetAccountParameter<account> & Omit<Args, 'account'> & {}

  export type Args = {
    /** Account address. */
    account: Address
    /** Address of the spender. */
    spender: Address
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
    'allowance',
    never
  >

  /**
   * Defines a call to the `allowance` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, spender, token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'allowance',
      args: [account, spender],
    })
  }
}

/**
 * Gets TIP20 token balance for an address.
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
 * const balance = await Actions.token.getBalance(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token balance.
 */
export async function getBalance<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getBalance.Parameters<account>,
): Promise<getBalance.ReturnValue> {
  const { account = client.account, ...rest } = parameters
  const address = account ? parseAccount(account).address : undefined
  if (!address) throw new Error('account is required.')
  return readContract(client, {
    ...rest,
    ...getBalance.call({ account: address, ...rest }),
  })
}

export namespace getBalance {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters & GetAccountParameter<account> & Omit<Args, 'account'>

  export type Args = {
    /** Account address. */
    account: Address
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
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
    const { account, token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'balanceOf',
      args: [account],
    })
  }
}

/**
 * Gets TIP20 token metadata including name, symbol, currency, decimals, and total supply.
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
 * const metadata = await Actions.token.getMetadata(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token metadata.
 */
export async function getMetadata<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getMetadata.Parameters,
): Promise<getMetadata.ReturnValue> {
  const { token, ...rest } = parameters
  const address = TokenId.toAddress(token)
  const abi = Abis.tip20

  if (TokenId.from(token) === TokenId.fromAddress(Addresses.pathUsd))
    return multicall(client, {
      ...rest,
      contracts: [
        {
          address,
          abi,
          functionName: 'currency',
        },
        {
          address,
          abi,
          functionName: 'decimals',
        },
        {
          address,
          abi,
          functionName: 'name',
        },
        {
          address,
          abi,
          functionName: 'symbol',
        },
        {
          address,
          abi,
          functionName: 'totalSupply',
        },
      ] as const,
      allowFailure: false,
      deployless: true,
    }).then(([currency, decimals, name, symbol, totalSupply]) => ({
      name,
      symbol,
      currency,
      decimals,
      totalSupply,
    }))

  return multicall(client, {
    ...rest,
    contracts: [
      {
        address,
        abi,
        functionName: 'currency',
      },
      {
        address,
        abi,
        functionName: 'decimals',
      },
      {
        address,
        abi,
        functionName: 'quoteToken',
      },
      {
        address,
        abi,
        functionName: 'name',
      },
      {
        address,
        abi,
        functionName: 'paused',
      },
      {
        address,
        abi,
        functionName: 'supplyCap',
      },
      {
        address,
        abi,
        functionName: 'symbol',
      },
      {
        address,
        abi,
        functionName: 'totalSupply',
      },
      {
        address,
        abi,
        functionName: 'transferPolicyId',
      },
    ] as const,
    allowFailure: false,
    deployless: true,
  }).then(
    ([
      currency,
      decimals,
      quoteToken,
      name,
      paused,
      supplyCap,
      symbol,
      totalSupply,
      transferPolicyId,
    ]) => ({
      name,
      symbol,
      currency,
      decimals,
      quoteToken,
      totalSupply,
      paused,
      supplyCap,
      transferPolicyId,
    }),
  )
}

export declare namespace getMetadata {
  export type Parameters = {
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = Compute<{
    /**
     * Currency (e.g. "USD").
     */
    currency: string
    /**
     * Decimals of the token.
     */
    decimals: number
    /**
     * Quote token.
     *
     * Returns `undefined` for the default quote token (`0x20c...0000`).
     */
    quoteToken?: Address | undefined
    /**
     * Name of the token.
     */
    name: string
    /**
     * Whether the token is paused.
     *
     * Returns `undefined` for the default quote token (`0x20c...0000`).
     */
    paused?: boolean | undefined
    /**
     * Supply cap.
     *
     * Returns `undefined` for the default quote token (`0x20c...0000`).
     */
    supplyCap?: bigint | undefined
    /**
     * Symbol of the token.
     */
    symbol: string
    /**
     * Total supply of the token.
     */
    totalSupply: bigint
    /**
     * Transfer policy ID.
     * 0="always-reject", 1="always-allow", >2=custom policy
     *
     * Returns `undefined` for the default quote token (`0x20c...0000`).
     */
    transferPolicyId?: bigint | undefined
  }>
}

/**
 * Gets the admin role for a specific role in a TIP20 token.
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
 * const adminRole = await Actions.token.getRoleAdmin(client, {
 *   role: 'issuer',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The admin role hash.
 */
export async function getRoleAdmin<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getRoleAdmin.Parameters,
): Promise<getRoleAdmin.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getRoleAdmin.call(parameters),
  })
}

export namespace getRoleAdmin {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Role to get admin for. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
    'getRoleAdmin',
    never
  >

  /**
   * Defines a call to the `getRoleAdmin` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { role, token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'getRoleAdmin',
      args: [TokenRole.serialize(role)],
    })
  }
}

/**
 * Checks if an account has a specific role for a TIP20 token.
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
 * const hasRole = await Actions.token.hasRole(client, {
 *   account: '0x...',
 *   role: 'issuer',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the account has the role.
 */
export async function hasRole<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: hasRole.Parameters<account>,
): Promise<hasRole.ReturnValue> {
  const { account = client.account } = parameters
  const address = account ? parseAccount(account).address : undefined
  if (!address) throw new Error('account is required.')
  return readContract(client, {
    ...parameters,
    ...hasRole.call({ ...parameters, account: address }),
  })
}

export namespace hasRole {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = ReadParameters & Omit<Args, 'account'> & GetAccountParameter<account>

  export type Args = {
    /** Account address to check. */
    account: Address
    /** Role to check. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.tip20,
    'hasRole',
    never
  >

  /**
   * Defines a call to the `hasRole` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, role, token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'hasRole',
      args: [account, TokenRole.serialize(role)],
    })
  }
}

/**
 * Grants a role for a TIP20 token.
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
 * const result = await Actions.token.grantRoles(client, {
 *   token: '0x...',
 *   to: '0x...',
 *   roles: ['issuer'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function grantRoles<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: grantRoles.Parameters<chain, account>,
): Promise<grantRoles.ReturnValue> {
  return grantRoles.inner(sendTransaction, client, parameters)
}

export namespace grantRoles {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'role'> & {
      /** Role to grant. */
      roles: readonly TokenRole.TokenRole[]
    }

  export type Args = {
    /** Role to grant. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
    /** Address to grant the role to. */
    to: Address
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
    parameters: grantRoles.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      calls: parameters.roles.map((role) => {
        const call = grantRoles.call({ ...parameters, role })
        return {
          ...call,
          data: encodeFunctionData(call),
        }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `grantRole` function.
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
   *     actions.token.grantRoles.call({
   *       token: '0x20c0...babe',
   *       to: '0x20c0...beef',
   *       role: 'issuer',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, to, role } = args
    const roleHash = TokenRole.serialize(role)
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'grantRole',
      args: [roleHash, to],
    })
  }

  /**
   * Extracts the events from the logs.
   *
   * @param logs - Logs.
   * @returns The events.
   */
  export function extractEvents(logs: Log[]) {
    const events = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'RoleMembershipUpdated',
    })
    if (events.length === 0)
      throw new Error('`RoleMembershipUpdated` events not found.')
    return events
  }
}

/**
 * Grants a role for a TIP20 token.
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
 * const result = await Actions.token.grantRolesSync(client, {
 *   token: '0x...',
 *   to: '0x...',
 *   roles: ['issuer'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function grantRolesSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: grantRolesSync.Parameters<chain, account>,
): Promise<grantRolesSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await grantRoles.inner(sendTransactionSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const events = grantRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return {
    receipt,
    value,
  }
}

export namespace grantRolesSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = grantRoles.Parameters<chain, account>

  export type Args = grantRoles.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
    value: readonly GetEventArgs<
      typeof Abis.tip20,
      'RoleMembershipUpdated',
      { IndexedOnly: false; Required: true }
    >[]
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Mints TIP20 tokens to an address.
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
 * const result = await Actions.token.mint(client, {
 *   to: '0x...',
 *   amount: 100n,
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function mint<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: mint.Parameters<chain, account>,
): Promise<mint.ReturnValue> {
  return mint.inner(writeContract, client, parameters)
}

export namespace mint {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokens to mint. */
    amount: bigint
    /** Memo to include in the mint. */
    memo?: Hex.Hex | undefined
    /** Address to mint tokens to. */
    to: Address
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: any,
  ): Promise<ReturnType<action>> {
    const call = mint.call(parameters)
    return (await action(client, {
      ...parameters,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `mint` or `mintWithMemo` function.
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
   *     actions.token.mint.call({
   *       to: '0x20c0...beef',
   *       amount: 100n,
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { to, amount, memo, token } = args
    const callArgs = memo
      ? ({
          functionName: 'mintWithMemo',
          args: [to, amount, Hex.padLeft(memo, 32)],
        } as const)
      : ({
          functionName: 'mint',
          args: [to, amount],
        } as const)
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      ...callArgs,
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'Mint',
    })
    if (!log) throw new Error('`Mint` event not found.')
    return log
  }
}

/**
 * Mints TIP20 tokens to an address.
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
 * const result = await Actions.token.mintSync(client, {
 *   to: '0x...',
 *   amount: 100n,
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function mintSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: mintSync.Parameters<chain, account>,
): Promise<mintSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await mint.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = mint.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace mintSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = mint.Parameters<chain, account>

  export type Args = mint.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20,
      'Mint',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Pauses a TIP20 token.
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
 * const result = await Actions.token.pause(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function pause<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: pause.Parameters<chain, account>,
): Promise<pause.ReturnValue> {
  return pause.inner(writeContract, client, parameters)
}

export namespace pause {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: pause.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { token, ...rest } = parameters
    const call = pause.call({ token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `pause` function.
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
   *     actions.token.pause.call({
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'pause',
      args: [],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'PauseStateUpdate',
    })
    if (!log) throw new Error('`PauseStateUpdate` event not found.')
    return log
  }
}

/**
 * Pauses a TIP20 token.
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
 * const result = await Actions.token.pauseSync(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function pauseSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: pauseSync.Parameters<chain, account>,
): Promise<pauseSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await pause.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = pause.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  }
}

export namespace pauseSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = pause.Parameters<chain, account>

  export type Args = pause.Args

  export type ReturnValue = GetEventArgs<
    typeof Abis.tip20,
    'PauseStateUpdate',
    { IndexedOnly: false; Required: true }
  > & {
    receipt: TransactionReceipt
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Renounces a role for a TIP20 token.
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
 * const result = await Actions.token.renounceRoles(client, {
 *   token: '0x...',
 *   roles: ['issuer'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function renounceRoles<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: renounceRoles.Parameters<chain, account>,
): Promise<renounceRoles.ReturnValue> {
  return renounceRoles.inner(sendTransaction, client, parameters)
}

export namespace renounceRoles {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'role'> & {
      /** Roles to renounce. */
      roles: readonly TokenRole.TokenRole[]
    }

  export type Args = {
    /** Role to renounce. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: renounceRoles.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      calls: parameters.roles.map((role) => {
        const call = renounceRoles.call({ ...parameters, role })
        return {
          ...call,
          data: encodeFunctionData(call),
        }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `renounceRole` function.
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
   *     actions.token.renounceRoles.call({
   *       token: '0x20c0...babe',
   *       role: 'issuer',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, role } = args
    const roleHash = TokenRole.serialize(role)
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'renounceRole',
      args: [roleHash],
    })
  }

  /**
   * Extracts the events from the logs.
   *
   * @param logs - Logs.
   * @returns The events.
   */
  export function extractEvents(logs: Log[]) {
    const events = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'RoleMembershipUpdated',
    })
    if (events.length === 0)
      throw new Error('`RoleMembershipUpdated` events not found.')
    return events
  }
}

/**
 * Renounces a role for a TIP20 token.
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
 * const result = await Actions.token.renounceRolesSync(client, {
 *   token: '0x...',
 *   roles: ['issuer'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function renounceRolesSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: renounceRolesSync.Parameters<chain, account>,
): Promise<renounceRolesSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await renounceRoles.inner(sendTransactionSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const events = renounceRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return {
    receipt,
    value,
  }
}

export namespace renounceRolesSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = renounceRoles.Parameters<chain, account>

  export type Args = renounceRoles.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
    value: readonly GetEventArgs<
      typeof Abis.tip20,
      'RoleMembershipUpdated',
      { IndexedOnly: false; Required: true }
    >[]
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Revokes a role for a TIP20 token.
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
 * const result = await Actions.token.revokeRoles(client, {
 *   token: '0x...',
 *   from: '0x...',
 *   roles: ['issuer'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function revokeRoles<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeRoles.Parameters<chain, account>,
): Promise<revokeRoles.ReturnValue> {
  return revokeRoles.inner(sendTransaction, client, parameters)
}

export namespace revokeRoles {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = SendTransactionSyncParameters<chain, account> &
    Omit<Args, 'role'> & {
      /** Role to revoke. */
      roles: readonly TokenRole.TokenRole[]
    }

  export type Args = {
    /** Address to revoke the role from. */
    from: Address
    /** Role to revoke. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: revokeRoles.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    return (await action(client, {
      ...parameters,
      calls: parameters.roles.map((role) => {
        const call = revokeRoles.call({ ...parameters, role })
        return {
          ...call,
          data: encodeFunctionData(call),
        }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `revokeRole` function.
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
   *     actions.token.revokeRoles.call({
   *       token: '0x20c0...babe',
   *       from: '0x20c0...beef',
   *       role: 'issuer',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, from, role } = args
    const roleHash = TokenRole.serialize(role)
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'revokeRole',
      args: [roleHash, from],
    })
  }

  /**
   * Extracts the events from the logs.
   *
   * @param logs - Logs.
   * @returns The events.
   */
  export function extractEvents(logs: Log[]) {
    const events = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'RoleMembershipUpdated',
    })
    if (events.length === 0)
      throw new Error('`RoleMembershipUpdated` events not found.')
    return events
  }
}

/**
 * Revokes a role for a TIP20 token.
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
 * const result = await Actions.token.revokeRolesSync(client, {
 *   token: '0x...',
 *   from: '0x...',
 *   roles: ['issuer'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function revokeRolesSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeRolesSync.Parameters<chain, account>,
): Promise<revokeRolesSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await revokeRoles.inner(sendTransactionSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const events = revokeRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return {
    receipt,
    value,
  }
}

export namespace revokeRolesSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = revokeRoles.Parameters<chain, account>

  export type Args = revokeRoles.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
    value: readonly GetEventArgs<
      typeof Abis.tip20,
      'RoleMembershipUpdated',
      { IndexedOnly: false; Required: true }
    >[]
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Sets the supply cap for a TIP20 token.
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
 * const result = await Actions.token.setSupplyCap(client, {
 *   token: '0x...',
 *   supplyCap: 1000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setSupplyCap<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setSupplyCap.Parameters<chain, account>,
): Promise<setSupplyCap.ReturnValue> {
  return setSupplyCap.inner(writeContract, client, parameters)
}

export namespace setSupplyCap {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** New supply cap. */
    supplyCap: bigint
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: setSupplyCap.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { supplyCap, token, ...rest } = parameters
    const call = setSupplyCap.call({ supplyCap, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `setSupplyCap` function.
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
   *     actions.token.setSupplyCap.call({
   *       token: '0x20c0...babe',
   *       supplyCap: 1000000n,
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, supplyCap } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'setSupplyCap',
      args: [supplyCap],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'SupplyCapUpdate',
    })
    if (!log) throw new Error('`SupplyCapUpdate` event not found.')
    return log
  }
}

/**
 * Sets the supply cap for a TIP20 token.
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
 * const result = await Actions.token.setSupplyCapSync(client, {
 *   token: '0x...',
 *   supplyCap: 1000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setSupplyCapSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setSupplyCapSync.Parameters<chain, account>,
): Promise<setSupplyCapSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setSupplyCap.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setSupplyCap.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace setSupplyCapSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setSupplyCap.Parameters<chain, account>

  export type Args = setSupplyCap.Args

  export type ReturnValue = GetEventArgs<
    typeof Abis.tip20,
    'SupplyCapUpdate',
    { IndexedOnly: false; Required: true }
  > & {
    receipt: TransactionReceipt
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Sets the admin role for a specific role in a TIP20 token.
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
 * const result = await Actions.token.setRoleAdmin(client, {
 *   token: '0x...',
 *   role: 'issuer',
 *   adminRole: 'admin',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setRoleAdmin<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setRoleAdmin.Parameters<chain, account>,
): Promise<setRoleAdmin.ReturnValue> {
  return setRoleAdmin.inner(writeContract, client, parameters)
}

export namespace setRoleAdmin {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** New admin role. */
    adminRole: TokenRole.TokenRole
    /** Role to set admin for. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: setRoleAdmin.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { adminRole, role, token, ...rest } = parameters
    const call = setRoleAdmin.call({ adminRole, role, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `setRoleAdmin` function.
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
   *     actions.token.setRoleAdmin.call({
   *       token: '0x20c0...babe',
   *       role: 'issuer',
   *       adminRole: 'admin',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, role, adminRole } = args
    const roleHash = TokenRole.serialize(role)
    const adminRoleHash = TokenRole.serialize(adminRole)
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'setRoleAdmin',
      args: [roleHash, adminRoleHash],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'RoleAdminUpdated',
    })
    if (!log) throw new Error('`RoleAdminUpdated` event not found.')
    return log
  }
}

/**
 * Sets the admin role for a specific role in a TIP20 token.
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
 * const result = await Actions.token.setRoleAdminSync(client, {
 *   token: '0x...',
 *   role: 'issuer',
 *   adminRole: 'admin',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setRoleAdminSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setRoleAdminSync.Parameters<chain, account>,
): Promise<setRoleAdminSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setRoleAdmin.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setRoleAdmin.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace setRoleAdminSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setRoleAdmin.Parameters<chain, account>

  export type Args = setRoleAdmin.Args

  export type ReturnValue = GetEventArgs<
    typeof Abis.tip20,
    'RoleAdminUpdated',
    { IndexedOnly: false; Required: true }
  > & {
    receipt: TransactionReceipt
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Transfers TIP20 tokens to another address.
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
 * const result = await Actions.token.transfer(client, {
 *   to: '0x...',
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function transfer<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: transfer.Parameters<chain, account>,
): Promise<transfer.ReturnValue> {
  return transfer.inner(writeContract, client, parameters)
}

export namespace transfer {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount of tokens to transfer. */
    amount: bigint
    /** Address to transfer tokens from. */
    from?: Address | undefined
    /** Memo to include in the transfer. */
    memo?: Hex.Hex | undefined
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
    /** Address to transfer tokens to. */
    to: Address
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
    parameters: transfer.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { amount, from, memo, token, to, ...rest } = parameters
    const call = transfer.call({ amount, from, memo, token, to })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `transfer`, `transferFrom`, `transferWithMemo`, or `transferFromWithMemo` function.
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
   *     actions.token.transfer.call({
   *       to: '0x20c0...beef',
   *       amount: 100n,
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { amount, from, memo, token, to } = args
    const callArgs = (() => {
      if (memo && from)
        return {
          functionName: 'transferFromWithMemo',
          args: [from, to, amount, Hex.padLeft(memo, 32)],
        } as const
      if (memo)
        return {
          functionName: 'transferWithMemo',
          args: [to, amount, Hex.padLeft(memo, 32)],
        } as const
      if (from)
        return {
          functionName: 'transferFrom',
          args: [from, to, amount],
        } as const
      return {
        functionName: 'transfer',
        args: [to, amount],
      } as const
    })()
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      ...callArgs,
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'Transfer',
    })
    if (!log) throw new Error('`Transfer` event not found.')
    return log
  }
}

/**
 * Transfers TIP20 tokens to another address.
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
 * const result = await Actions.token.transferSync(client, {
 *   to: '0x...',
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function transferSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: transferSync.Parameters<chain, account>,
): Promise<transferSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await transfer.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = transfer.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace transferSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = transfer.Parameters<chain, account>

  export type Args = transfer.Args

  export type ReturnValue = GetEventArgs<
    typeof Abis.tip20,
    'Transfer',
    { IndexedOnly: false; Required: true }
  > & {
    receipt: TransactionReceipt
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Unpauses a TIP20 token.
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
 * const result = await Actions.token.unpause(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function unpause<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: unpause.Parameters<chain, account>,
): Promise<unpause.ReturnValue> {
  return unpause.inner(writeContract, client, parameters)
}

export namespace unpause {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: unpause.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { token, ...rest } = parameters
    const call = unpause.call({ token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `unpause` function.
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
   *     actions.token.unpause.call({
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'unpause',
      args: [],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'PauseStateUpdate',
    })
    if (!log) throw new Error('`PauseStateUpdate` event not found.')
    return log
  }
}

/**
 * Unpauses a TIP20 token.
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
 * const result = await Actions.token.unpauseSync(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function unpauseSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: unpauseSync.Parameters<chain, account>,
): Promise<unpauseSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await unpause.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = unpause.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace unpauseSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = unpause.Parameters<chain, account>

  export type Args = unpause.Args

  export type ReturnValue = GetEventArgs<
    typeof Abis.tip20,
    'PauseStateUpdate',
    { IndexedOnly: false; Required: true }
  > & {
    receipt: TransactionReceipt
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Updates the quote token for a TIP20 token.
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
 * const result = await Actions.token.prepareUpdateQuoteToken(client, {
 *   token: '0x...',
 *   quoteToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function prepareUpdateQuoteToken<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: prepareUpdateQuoteToken.Parameters<chain, account>,
): Promise<prepareUpdateQuoteToken.ReturnValue> {
  return prepareUpdateQuoteToken.inner(writeContract, client, parameters)
}

export namespace prepareUpdateQuoteToken {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** New quote token address. */
    quoteToken: TokenId.TokenIdOrAddress
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: prepareUpdateQuoteToken.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { quoteToken, token, ...rest } = parameters
    const call = prepareUpdateQuoteToken.call({ quoteToken, token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `prepareUpdateQuoteToken` function.
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
   *     actions.token.prepareUpdateQuoteToken.call({
   *       token: '0x20c0...babe',
   *       quoteToken: '0x20c0...cafe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token, quoteToken } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'setNextQuoteToken',
      args: [TokenId.toAddress(quoteToken)],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'NextQuoteTokenSet',
    })
    if (!log) throw new Error('`NextQuoteTokenSet` event not found.')
    return log
  }
}

/**
 * Updates the quote token for a TIP20 token.
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
 * const result = await Actions.token.prepareUpdateQuoteTokenSync(client, {
 *   token: '0x...',
 *   quoteToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function prepareUpdateQuoteTokenSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: prepareUpdateQuoteTokenSync.Parameters<chain, account>,
): Promise<prepareUpdateQuoteTokenSync.ReturnValue> {
  const receipt = await prepareUpdateQuoteToken.inner(
    writeContractSync,
    client,
    parameters,
  )
  const { args } = prepareUpdateQuoteToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace prepareUpdateQuoteTokenSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = prepareUpdateQuoteToken.Parameters<chain, account>

  export type Args = prepareUpdateQuoteToken.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20,
      'NextQuoteTokenSet',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Updates the quote token for a TIP20 token.
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
 * const result = await Actions.token.updateQuoteToken(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function updateQuoteToken<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateQuoteToken.Parameters<chain, account>,
): Promise<updateQuoteToken.ReturnValue> {
  return updateQuoteToken.inner(writeContract, client, parameters)
}

export namespace updateQuoteToken {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
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
    parameters: updateQuoteToken.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { token, ...rest } = parameters
    const call = updateQuoteToken.call({ token })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `updateQuoteToken` function.
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
   *     actions.token.updateQuoteToken.call({
   *       token: '0x20c0...babe',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { token } = args
    return defineCall({
      address: TokenId.toAddress(token),
      abi: Abis.tip20,
      functionName: 'completeQuoteTokenUpdate',
      args: [],
    })
  }

  /**
   * Extracts the event from the logs.
   *
   * @param logs - Logs.
   * @returns The event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20,
      logs,
      eventName: 'QuoteTokenUpdate',
    })
    if (!log) throw new Error('`QuoteTokenUpdateCompleted` event not found.')
    return log
  }
}

/**
 * Updates the quote token for a TIP20 token.
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
 * const result = await Actions.token.updateQuoteTokenSync(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function updateQuoteTokenSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateQuoteTokenSync.Parameters<chain, account>,
): Promise<updateQuoteTokenSync.ReturnValue> {
  const receipt = await updateQuoteToken.inner(
    writeContractSync,
    client,
    parameters,
  )
  const { args } = updateQuoteToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace updateQuoteTokenSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = updateQuoteToken.Parameters<chain, account>

  export type Args = updateQuoteToken.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20,
      'QuoteTokenUpdate',
      {
        IndexedOnly: false
        Required: true
      }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Watches for TIP20 token approval events.
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
 * const unwatch = actions.token.watchApprove(client, {
 *   onApproval: (args, log) => {
 *     console.log('Approval:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchApprove<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchApprove.Parameters,
) {
  const { onApproval, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: TokenId.toAddress(token),
    abi: Abis.tip20,
    eventName: 'Approval',
    onLogs: (logs) => {
      for (const log of logs) onApproval(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchApprove {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'Approval',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'Approval'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'Approval', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when tokens are approved. */
    onApproval: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }
}

/**
 * Watches for TIP20 token burn events.
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
 * const unwatch = actions.token.watchBurn(client, {
 *   onBurn: (args, log) => {
 *     console.log('Burn:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBurn<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>, parameters: watchBurn.Parameters) {
  const { onBurn, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: TokenId.toAddress(token),
    abi: Abis.tip20,
    eventName: 'Burn',
    onLogs: (logs) => {
      for (const log of logs) onBurn(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchBurn {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'Burn',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'Burn'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'Burn', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when tokens are burned. */
    onBurn: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }
}

/**
 * Watches for new TIP20 tokens created.
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
 * const unwatch = actions.token.watchCreate(client, {
 *   onTokenCreated: (args, log) => {
 *     console.log('Token created:', args)
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
  const { onTokenCreated, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.tip20Factory,
    abi: Abis.tip20Factory,
    eventName: 'TokenCreated',
    onLogs: (logs) => {
      for (const log of logs) onTokenCreated(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchCreate {
  export type Args = GetEventArgs<
    typeof Abis.tip20Factory,
    'TokenCreated',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20Factory, 'TokenCreated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip20Factory,
      'TokenCreated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a new TIP20 token is created. */
    onTokenCreated: (args: Args, log: Log) => void
  }
}

/**
 * Watches for TIP20 token mint events.
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
 * const unwatch = actions.token.watchMint(client, {
 *   onMint: (args, log) => {
 *     console.log('Mint:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchMint<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>, parameters: watchMint.Parameters) {
  const { onMint, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: TokenId.toAddress(token),
    abi: Abis.tip20,
    eventName: 'Mint',
    onLogs: (logs) => {
      for (const log of logs) onMint(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchMint {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'Mint',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'Mint'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'Mint', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when tokens are minted. */
    onMint: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = WatchContractEventReturnType
}

/**
 * Watches for TIP20 token role admin updates.
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
 * const unwatch = actions.token.watchAdminRole(client, {
 *   onRoleAdminUpdated: (args, log) => {
 *     console.log('Role admin updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchAdminRole<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchAdminRole.Parameters,
) {
  const { onRoleAdminUpdated, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: TokenId.toAddress(token),
    abi: Abis.tip20,
    eventName: 'RoleAdminUpdated',
    onLogs: (logs) => {
      for (const log of logs) onRoleAdminUpdated(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchAdminRole {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'RoleAdminUpdated',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'RoleAdminUpdated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'RoleAdminUpdated', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a role admin is updated. */
    onRoleAdminUpdated: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }
}

/**
 * Watches for TIP20 token role membership updates.
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
 * const unwatch = actions.token.watchRole(client, {
 *   onRoleUpdated: (args, log) => {
 *     console.log('Role updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchRole<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>, parameters: watchRole.Parameters) {
  const { onRoleUpdated, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: TokenId.toAddress(token),
    abi: Abis.tip20,
    eventName: 'RoleMembershipUpdated',
    onLogs: (logs) => {
      for (const log of logs) {
        const type = log.args.hasRole ? 'granted' : 'revoked'
        onRoleUpdated({ ...log.args, type }, log)
      }
    },
    strict: true,
  })
}

export declare namespace watchRole {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'RoleMembershipUpdated',
    { IndexedOnly: false; Required: true }
  > & {
    /** Type of role update. */
    type: 'granted' | 'revoked'
  }

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'RoleMembershipUpdated'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.tip20,
      'RoleMembershipUpdated',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a role membership is updated. */
    onRoleUpdated: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }
}

/**
 * Watches for TIP20 token transfer events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const unwatch = actions.token.watchTransfer(client, {
 *   onTransfer: (args, log) => {
 *     console.log('Transfer:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchTransfer<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchTransfer.Parameters,
) {
  const { onTransfer, token, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: TokenId.toAddress(token),
    abi: Abis.tip20,
    eventName: 'Transfer',
    onLogs: (logs) => {
      for (const log of logs) onTransfer(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchTransfer {
  export type Args = GetEventArgs<
    typeof Abis.tip20,
    'Transfer',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.tip20, 'Transfer'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, 'Transfer', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when tokens are transferred. */
    onTransfer: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }
}

/**
 * Watches for TIP20 token quote token update events.
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
 * const unwatch = actions.token.watchUpdateQuoteToken(client, {
 *   onUpdateQuoteToken: (args, log) => {
 *     if (args.completed)
 *       console.log('quote token update completed:', args.newQuoteToken)
 *     else
 *       console.log('quote token update proposed:', args.newQuoteToken)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchUpdateQuoteToken<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchUpdateQuoteToken.Parameters,
) {
  const { onUpdateQuoteToken, token, ...rest } = parameters
  const address = TokenId.toAddress(token)

  return watchContractEvent(client, {
    ...rest,
    address,
    abi: Abis.tip20,
    onLogs: (
      logs: viem_Log<
        bigint,
        number,
        false,
        ExtractAbiItem<
          typeof Abis.tip20,
          'NextQuoteTokenSet' | 'QuoteTokenUpdate'
        >,
        true
      >[],
    ) => {
      for (const log of logs) {
        if (
          log.eventName !== 'NextQuoteTokenSet' &&
          log.eventName !== 'QuoteTokenUpdate'
        )
          continue

        onUpdateQuoteToken(
          {
            ...log.args,
            completed: log.eventName === 'QuoteTokenUpdate',
          },
          log,
        )
      }
    },
    strict: true,
  } as never)
}

export declare namespace watchUpdateQuoteToken {
  export type Args = OneOf<
    | GetEventArgs<
        typeof Abis.tip20,
        'NextQuoteTokenSet',
        { IndexedOnly: false; Required: true }
      >
    | GetEventArgs<
        typeof Abis.tip20,
        'QuoteTokenUpdate',
        { IndexedOnly: false; Required: true }
      >
  > & {
    /** Whether the update has been completed. */
    completed: boolean
  }

  export type Log = viem_Log

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.tip20, any, true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a quote token update is proposed or completed. */
    onUpdateQuoteToken: (args: Args, log: Log) => void
    /** Address or ID of the TIP20 token. */
    token: TokenId.TokenIdOrAddress
  }
}
