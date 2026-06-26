import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { multicall } from '../../actions/public/multicall.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js'
import { watchContractEvent } from '../../actions/public/watchContractEvent.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log, Log as viem_Log } from '../../types/log.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { Compute, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { parseUnits } from '../../utils/unit/parseUnits.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/** Default decimals used to parse a human-readable `amount` string. */
const defaultDecimals = 18

/**
 * Gets the ERC-20 allowance a spender has over an owner's tokens.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const allowance = await Actions.erc20.allowance(client, {
 *   address: '0x...',
 *   owner: '0x...',
 *   spender: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The allowance.
 */
export async function allowance<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: allowance.Parameters,
): Promise<allowance.ReturnValue> {
  const { address, owner, spender, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...allowance.call({ address, owner, spender }),
  })
}

export namespace allowance {
  export type Args = {
    /** Address of the token contract. */
    address: Address
    /** Owner of the tokens. */
    owner: Address
    /** Spender of the tokens. */
    spender: Address
  }
  export type Parameters = ReadParameters & Args
  export type ReturnValue = ReadContractReturnType<
    typeof erc20Abi,
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
    return defineCall({
      address: args.address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [args.owner, args.spender],
    })
  }
}

/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.erc20.approve(client, {
 *   address: '0x...',
 *   amount: '100',
 *   spender: '0x...',
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
  const { address, spender, amount, decimals } = parameters
  return approve.inner(writeContract, client, parameters, {
    address,
    spender,
    amount,
    decimals,
  })
}

export namespace approve {
  export type Args = {
    /** Address of the token contract. */
    address: Address
    /** Amount of tokens to approve, as a human-readable decimal string (e.g. `'10.5'`). */
    amount: string
    /** Decimals used to parse `amount`. Defaults to `18`. */
    decimals?: number | undefined
    /** Address of the spender. */
    spender: Address
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
   * Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
   * `sendCalls`, `sendTransaction` (`calls`), or `multicall`.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    return defineCall({
      address: args.address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [
        args.spender,
        parseUnits(args.amount, args.decimals ?? defaultDecimals),
      ],
    })
  }

  /**
   * Extracts the `Approval` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Approval` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: 'Approval',
      strict: true,
    })
    if (!log) throw new Error('`Approval` event not found.')
    return log
  }
}

/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller, and
 * waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.erc20.approveSync(client, {
 *   address: '0x...',
 *   amount: '100',
 *   spender: '0x...',
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
  const {
    throwOnReceiptRevert = true,
    address,
    spender,
    amount,
    decimals,
  } = parameters
  const receipt = await approve.inner(
    writeContractSync,
    client,
    { ...parameters, throwOnReceiptRevert } as never,
    { address, spender, amount, decimals },
  )
  const { args } = approve.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace approveSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = approve.Parameters<chain, account>
  export type Args = approve.Args
  export type ReturnValue = Compute<
    GetEventArgs<
      typeof erc20Abi,
      'Approval',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the ERC-20 token balance of an account.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const balance = await Actions.erc20.getBalance(client, {
 *   account: '0x...',
 *   address: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token balance.
 */
export async function getBalance<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getBalance.Parameters,
): Promise<getBalance.ReturnValue> {
  const { address, account, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getBalance.call({ address, account }),
  })
}

export namespace getBalance {
  export type Args = {
    /** Account to get the balance of. */
    account: Address
    /** Address of the token contract. */
    address: Address
  }
  export type Parameters = ReadParameters & Args
  export type ReturnValue = ReadContractReturnType<
    typeof erc20Abi,
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
    return defineCall({
      address: args.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [args.account],
    })
  }
}

/**
 * Gets the ERC-20 token metadata (`name`, `symbol`, `decimals`, and
 * `totalSupply`) in a single multicall.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const metadata = await Actions.erc20.getMetadata(client, {
 *   address: '0x...',
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
  const { address, blockNumber, blockOverrides, blockTag, stateOverride } =
    parameters
  const [name, symbol, decimals, totalSupply] = await multicall(client, {
    blockNumber,
    blockOverrides,
    blockTag,
    stateOverride,
    allowFailure: false,
    contracts: [
      { address, abi: erc20Abi, functionName: 'name' },
      { address, abi: erc20Abi, functionName: 'symbol' },
      { address, abi: erc20Abi, functionName: 'decimals' },
      { address, abi: erc20Abi, functionName: 'totalSupply' },
    ] as const,
  })
  return { name, symbol, decimals, totalSupply }
}

export namespace getMetadata {
  export type Args = {
    /** Address of the token contract. */
    address: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  export type ReturnValue = {
    /** Token decimals. */
    decimals: number
    /** Token name. */
    name: string
    /** Token symbol. */
    symbol: string
    /** Token total supply. */
    totalSupply: bigint
  }
}

/**
 * Transfers ERC-20 tokens to another address.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.erc20.transfer(client, {
 *   address: '0x...',
 *   amount: '100',
 *   to: '0x...',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Transfer on behalf of another address (via an allowance).
 * const hash = await Actions.erc20.transfer(client, {
 *   address: '0x...',
 *   amount: '100',
 *   from: '0x...',
 *   to: '0x...',
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
  const { address, from, to, amount, decimals } = parameters
  return transfer.inner(writeContract, client, parameters, {
    address,
    from,
    to,
    amount,
    decimals,
  })
}

export namespace transfer {
  export type Args = {
    /** Address of the token contract. */
    address: Address
    /** Amount of tokens to transfer, as a human-readable decimal string (e.g. `'10.5'`). */
    amount: string
    /** Decimals used to parse `amount`. Defaults to `18`. */
    decimals?: number | undefined
    /** Address to transfer tokens from (uses an allowance via `transferFrom`). */
    from?: Address | undefined
    /** Address to transfer tokens to. */
    to: Address
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
    parameters: transfer.Parameters<chain, account>,
    args: Args,
  ): Promise<ReturnType<action>> {
    const call = transfer.call(args)
    return (await action(client, {
      ...parameters,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `transfer` (or `transferFrom`, when `from` is given)
   * function.
   *
   * Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
   * `sendCalls`, `sendTransaction` (`calls`), or `multicall`.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const value = parseUnits(args.amount, args.decimals ?? defaultDecimals)
    if (args.from)
      return defineCall({
        address: args.address,
        abi: erc20Abi,
        functionName: 'transferFrom',
        args: [args.from, args.to, value],
      })
    return defineCall({
      address: args.address,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [args.to, value],
    })
  }

  /**
   * Extracts the `Transfer` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Transfer` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: 'Transfer',
      strict: true,
    })
    if (!log) throw new Error('`Transfer` event not found.')
    return log
  }
}

/**
 * Transfers ERC-20 tokens to another address, and waits for the transaction to
 * be confirmed.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await Actions.erc20.transferSync(client, {
 *   address: '0x...',
 *   amount: '100',
 *   to: '0x...',
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
  const {
    throwOnReceiptRevert = true,
    address,
    from,
    to,
    amount,
    decimals,
  } = parameters
  const receipt = await transfer.inner(
    writeContractSync,
    client,
    { ...parameters, throwOnReceiptRevert } as never,
    { address, from, to, amount, decimals },
  )
  const { args } = transfer.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace transferSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = transfer.Parameters<chain, account>
  export type Args = transfer.Args
  export type ReturnValue = Compute<
    GetEventArgs<
      typeof erc20Abi,
      'Transfer',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Watches for ERC-20 `Approval` events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const unwatch = Actions.erc20.watchApproval(client, {
 *   address: '0x...',
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
export function watchApproval<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: watchApproval.Parameters,
) {
  const { address, onApproval, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address,
    abi: erc20Abi,
    eventName: 'Approval',
    onLogs: (logs) => {
      for (const log of logs) onApproval(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchApproval {
  export type Args = GetEventArgs<
    typeof erc20Abi,
    'Approval',
    { IndexedOnly: false; Required: true }
  >
  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof erc20Abi, 'Approval'>,
    true
  >
  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof erc20Abi, 'Approval', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Address of the token contract. */
    address: Address
    /** Callback to invoke when tokens are approved. */
    onApproval: (args: Args, log: Log) => void
  }
}

/**
 * Watches for ERC-20 `Transfer` events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Actions } from 'viem/tokens'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const unwatch = Actions.erc20.watchTransfer(client, {
 *   address: '0x...',
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
export function watchTransfer<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: watchTransfer.Parameters,
) {
  const { address, onTransfer, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address,
    abi: erc20Abi,
    eventName: 'Transfer',
    onLogs: (logs) => {
      for (const log of logs) onTransfer(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchTransfer {
  export type Args = GetEventArgs<
    typeof erc20Abi,
    'Transfer',
    { IndexedOnly: false; Required: true }
  >
  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof erc20Abi, 'Transfer'>,
    true
  >
  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof erc20Abi, 'Transfer', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Address of the token contract. */
    address: Address
    /** Callback to invoke when tokens are transferred. */
    onTransfer: (args: Args, log: Log) => void
  }
}
