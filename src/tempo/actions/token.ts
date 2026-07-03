import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import * as Value from 'ox/Value'
import * as TokenId from 'ox/tempo/TokenId'
import * as TokenRole from 'ox/tempo/TokenRole'

import * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/Errors.js'
import { estimateGas as estimateContractGas } from '../../core/actions/contract/estimateGas.js'
import { read } from '../../core/actions/contract/read.js'
import { simulate as simulateContract } from '../../core/actions/contract/simulate.js'
import { watchEvent } from '../../core/actions/contract/watchEvent.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import {
  type Amount,
  type AmountInput,
  findDeclaredToken,
  resolveAmountDecimals,
  toAmount,
  toBaseUnits,
} from '../../core/actions/token/internal.js'
import { send } from '../../core/actions/transaction/send.js'
import { sendSync } from '../../core/actions/transaction/sendSync.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type {
  ReadParameters,
  TokenParameter,
  TokenParameters,
  WriteParameters,
} from '../internal/types.js'
import {
  defineCall,
  pickWriteParameters,
  resolveToken,
  resolveTokenWithDecimals,
} from '../internal/utils.js'

/**
 * Approves a spender to transfer TIP-20 tokens on behalf of the caller.
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
 * const hash = await Actions.token.approve(client, {
 *   amount: 100n,
 *   spender: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function approve<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: approve.Options,
): Promise<approve.ReturnType> {
  return approve.inner(write, client, options)
}

export namespace approve {
  export type Args = {
    /** Amount of tokens to approve, in base units or formatted decimal form. */
    amount: AmountInput
    /** Address of the spender. */
    spender: Address.Address
  } & TokenParameter

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: approve.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...approve.call(client, options),
    } as never)) as never
  }

  /**
   * Defines a call to the `approve` function. Can be passed to any action that
   * accepts a contract call. `amount.decimals` is inferred from the client's
   * declared `tokens` when omitted.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, spender, token } = args
    const { address, decimals } = resolveToken(client, { token })
    return defineCall({
      abi: Abis.tip20,
      address,
      args: [spender, toBaseUnits(amount, decimals)],
      functionName: 'approve',
    } as never)
  }

  /**
   * Estimates the gas required to approve a spender. `amount.decimals` is
   * inferred from the client's declared `tokens` when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: approve.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...approve.call(client, options),
    } as never)
  }

  /**
   * Simulates an approval of a spender. `amount.decimals` is inferred from the
   * client's declared `tokens` when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: approve.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'approve'>> {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...approve.call(client, options),
    } as never) as never
  }

  /** Extracts the `Approval` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Approval',
      strict: true,
    })
    if (!log) throw new BaseError('`Approval` event not found.')
    return log
  }
}

/**
 * Approves a spender to transfer TIP-20 tokens on behalf of the caller, and
 * waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.approveSync(client, {
 *   amount: 100n,
 *   spender: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function approveSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: approveSync.Options,
): Promise<approveSync.ReturnType<chain>> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await approve.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = approve.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.amount, resolved) }),
    receipt,
  } as never
}

export declare namespace approveSync {
  type Args = approve.Args

  type Options = approve.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Owner that approved the spender. */
    owner: Address.Address
    /** Spender approved to transfer the tokens. */
    spender: Address.Address
    /** Approved amount, in base units. */
    amount: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Approved amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Burns TIP-20 tokens from a blocked address.
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
 * const hash = await Actions.token.burnBlocked(client, {
 *   amount: 100n,
 *   from: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function burnBlocked<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnBlocked.Options,
): Promise<burnBlocked.ReturnType> {
  return burnBlocked.inner(write, client, options)
}

export namespace burnBlocked {
  export type Args = {
    /** Amount of tokens to burn, in base units or formatted decimal form. */
    amount: AmountInput
    /** Address to burn tokens from. */
    from: Address.Address
  } & TokenParameter

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: burnBlocked.Options,
  ): Promise<ActionReturnType<action>> {
    const { amount, from, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...burnBlocked.call(client, { amount, from, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `burnBlocked` function. Can be passed to any action
   * that accepts a contract call. `amount.decimals` is inferred from the
   * client's declared `tokens` when omitted.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, from, token } = args
    const { address, decimals } = resolveToken(client, { token })
    return defineCall({
      abi: Abis.tip20,
      address,
      args: [from, toBaseUnits(amount, decimals)],
      functionName: 'burnBlocked',
    } as never)
  }

  /** Extracts the `BurnBlocked` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'BurnBlocked',
      strict: true,
    })
    if (!log) throw new BaseError('`BurnBlocked` event not found.')
    return log
  }
}

/**
 * Burns TIP-20 tokens from a blocked address, and waits for the transaction to
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
 * const { receipt, ...event } = await Actions.token.burnBlockedSync(client, {
 *   amount: 100n,
 *   from: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function burnBlockedSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: burnBlockedSync.Options,
): Promise<burnBlockedSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await burnBlocked.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = burnBlocked.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace burnBlockedSync {
  type Args = burnBlocked.Args

  type Options = burnBlocked.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address the tokens were burned from. */
    from: Address.Address
    /** Burned amount, in base units. */
    amount: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Burns TIP-20 tokens from the caller's balance.
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
 * const hash = await Actions.token.burn(client, {
 *   amount: 100n,
 *   token: '0x…',
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
    /** Amount of tokens to burn, in base units or formatted decimal form. */
    amount: AmountInput
    /** Memo to include in the burn. */
    memo?: Hex.Hex | undefined
  } & TokenParameter

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: burn.Options,
  ): Promise<ActionReturnType<action>> {
    const { amount, memo, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...burn.call(client, { amount, memo, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `burn` (or `burnWithMemo`, when `memo` is given)
   * function. Can be passed to any action that accepts a contract call.
   * `amount.decimals` is inferred from the client's declared `tokens` when
   * omitted.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, memo, token } = args
    const { address, decimals } = resolveToken(client, { token })
    const value = toBaseUnits(amount, decimals)
    const callArgs = memo
      ? ({
          args: [value, Hex.padLeft(memo, 32)],
          functionName: 'burnWithMemo',
        } as const)
      : ({
          args: [value],
          functionName: 'burn',
        } as const)
    return defineCall({
      abi: Abis.tip20,
      address,
      ...callArgs,
    } as never)
  }

  /** Extracts the `Burn` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Burn',
      strict: true,
    })
    if (!log) throw new BaseError('`Burn` event not found.')
    return log
  }
}

/**
 * Burns TIP-20 tokens from the caller's balance, and waits for the transaction
 * to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.burnSync(client, {
 *   amount: 100n,
 *   token: '0x…',
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
    /** Address the tokens were burned from. */
    from: Address.Address
    /** Burned amount, in base units. */
    amount: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Changes the transfer policy ID for a TIP-20 token.
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
 * const hash = await Actions.token.changeTransferPolicy(client, {
 *   policyId: 1n,
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function changeTransferPolicy<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeTransferPolicy.Options,
): Promise<changeTransferPolicy.ReturnType> {
  return changeTransferPolicy.inner(write, client, options)
}

export namespace changeTransferPolicy {
  export type Args = {
    /** New transfer policy ID. */
    policyId: bigint
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: changeTransferPolicy.Options,
  ): Promise<ActionReturnType<action>> {
    const { policyId, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...changeTransferPolicy.call(client, { policyId, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `changeTransferPolicyId` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { policyId, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [policyId],
      functionName: 'changeTransferPolicyId',
    } as never)
  }

  /** Extracts the `TransferPolicyUpdate` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'TransferPolicyUpdate',
      strict: true,
    })
    if (!log) throw new BaseError('`TransferPolicyUpdate` event not found.')
    return log
  }
}

/**
 * Changes the transfer policy ID for a TIP-20 token, and waits for the
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
 * const { receipt, ...event } = await Actions.token.changeTransferPolicySync(
 *   client,
 *   { policyId: 1n, token: '0x…' },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function changeTransferPolicySync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeTransferPolicySync.Options,
): Promise<changeTransferPolicySync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await changeTransferPolicy.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = changeTransferPolicy.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace changeTransferPolicySync {
  type Args = changeTransferPolicy.Args

  type Options = changeTransferPolicy.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that updated the transfer policy. */
    updater: Address.Address
    /** New transfer policy ID. */
    newPolicyId: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Creates a new TIP-20 token.
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
 * const hash = await Actions.token.create(client, {
 *   currency: 'USD',
 *   logoURI: 'https://example.com/token.svg',
 *   name: 'My Token',
 *   symbol: 'MTK',
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
    /** Admin address. */
    admin: Address.Address
    /** Currency (e.g. "USD"). */
    currency: string
    /** Logo URI. Requires a T5-enabled Tempo chain. */
    logoURI?: string | undefined
    /** Token name. */
    name: string
    /** Quote token. */
    quoteToken?: TokenId.TokenIdOrAddress | undefined
    /** Unique salt. @default Hex.random(32) */
    salt?: Hex.Hex | undefined
    /** Token symbol. */
    symbol: string
  }

  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = WriteParameters &
    Omit<Args, 'admin'> &
    (account extends Account.Account
      ? {
          /** Admin (or address). @default client.account */
          admin?: Account.Account | Address.Address | undefined
        }
      : {
          /** Admin (or address). */
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
    const { admin: admin_ = client.account, ...rest } = options
    if (!admin_) throw new BaseError('admin is required.')
    const admin = typeof admin_ === 'string' ? admin_ : admin_.address
    return (await action(client, {
      ...rest,
      ...create.call(client, { ...rest, admin } as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `createToken` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const {
      admin,
      currency,
      logoURI,
      name,
      quoteToken = Addresses.pathUsd,
      salt = Hex.random(32),
      symbol,
    } = args
    return defineCall({
      abi: Abis.tip20Factory,
      address: Addresses.tip20Factory,
      args:
        typeof logoURI === 'string'
          ? [
              name,
              symbol,
              currency,
              resolveToken(client, { token: quoteToken }).address,
              admin,
              salt,
              logoURI,
            ]
          : [
              name,
              symbol,
              currency,
              resolveToken(client, { token: quoteToken }).address,
              admin,
              salt,
            ],
      functionName: 'createToken',
    } as never)
  }

  /** Extracts the `TokenCreated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20Factory, logs, {
      eventName: 'TokenCreated',
      strict: true,
    })
    if (!log) throw new BaseError('`TokenCreated` event not found.')
    return log
  }
}

/**
 * Creates a new TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { token, tokenId } = await Actions.token.createSync(client, {
 *   currency: 'USD',
 *   logoURI: 'https://example.com/token.svg',
 *   name: 'My Token',
 *   symbol: 'MTK',
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
    tokenId: TokenId.fromAddress(args.token),
  } as never
}

export declare namespace createSync {
  type Args = create.Args

  type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = create.Options<account>

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Token contract address. */
    token: Address.Address
    /** Token name. */
    name: string
    /** Token symbol. */
    symbol: string
    /** Currency (e.g. "USD"). */
    currency: string
    /** Quote token address. */
    quoteToken: Address.Address
    /** Admin address. */
    admin: Address.Address
    /** Salt used to derive the token address. */
    salt: Hex.Hex
    /** Token ID. */
    tokenId: TokenId.TokenId
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets TIP-20 token allowance.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const allowance = await Actions.token.getAllowance(client, {
 *   account: '0x…',
 *   spender: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token allowance, in base units and human-readable form.
 */
export async function getAllowance<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getAllowance.Options,
): Promise<getAllowance.ReturnType> {
  const { account, decimals, spender, token, ...rest } = options
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getAllowance.call(client, { account, spender, token }),
    } as never),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getAllowance {
  export type Args = {
    /** Account that owns the tokens. */
    account: Address.Address
    /** Spender of the tokens. */
    spender: Address.Address
  } & TokenParameters

  export type Options = ReadParameters & Args

  export type ReturnType = Amount

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `allowance` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, args).address,
      args: [args.account, args.spender],
      functionName: 'allowance',
    } as never)
  }
}

/**
 * Gets TIP-20 token balance for an address.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const balance = await Actions.token.getBalance(client, {
 *   account: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token balance, in base units and human-readable form.
 */
export async function getBalance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getBalance.Options,
): Promise<getBalance.ReturnType> {
  const {
    account: account_ = client.account,
    decimals,
    token,
    ...rest
  } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getBalance.call(client, { account: address, token }),
    } as never),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getBalance {
  export type Args = {
    /** Account (or address) that owns the tokens. @default client.account */
    account?: Account.Account | Address.Address | undefined
  } & TokenParameters

  export type Options = Omit<ReadParameters, 'account'> & Args

  export type ReturnType = Amount

  export type ErrorType =
    | Account.NotFoundError
    | read.ErrorType
    | Errors.GlobalErrorType

  /**
   * Defines a call to the `balanceOf` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const account_ = args.account ?? client.account
    if (!account_) throw new Account.NotFoundError()
    const account = typeof account_ === 'string' ? account_ : account_.address
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, args).address,
      args: [account],
      functionName: 'balanceOf',
    } as never)
  }
}

/**
 * Gets TIP-20 token metadata including name, symbol, logo URI, currency,
 * decimals, and total supply.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const metadata = await Actions.token.getMetadata(client, {
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token metadata.
 */
export async function getMetadata<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getMetadata.Options,
): Promise<getMetadata.ReturnType> {
  const { token, ...rest } = options
  const { address } = resolveToken(client, { token })
  const abi = Abis.tip20

  const declared = findDeclaredToken(client, address)
  const overrides = {
    ...(declared?.decimals != null ? { decimals: declared.decimals } : {}),
    ...(declared?.name != null ? { name: declared.name } : {}),
    ...(declared?.symbol != null ? { symbol: declared.symbol } : {}),
  }

  if (TokenId.fromAddress(address) === TokenId.fromAddress(Addresses.pathUsd)) {
    const [currency, decimals, logoURI, name, symbol, totalSupply] =
      await Promise.all([
        read(client, { ...rest, abi, address, functionName: 'currency' }),
        read(client, { ...rest, abi, address, functionName: 'decimals' }),
        read(client, { ...rest, abi, address, functionName: 'logoURI' }).catch(
          () => '',
        ),
        read(client, { ...rest, abi, address, functionName: 'name' }),
        read(client, { ...rest, abi, address, functionName: 'symbol' }),
        read(client, { ...rest, abi, address, functionName: 'totalSupply' }),
      ])
    return {
      name,
      symbol,
      currency,
      decimals,
      logoURI,
      totalSupply,
      ...overrides,
    }
  }

  const [
    currency,
    decimals,
    logoURI,
    quoteToken,
    name,
    paused,
    supplyCap,
    symbol,
    totalSupply,
    transferPolicyId,
  ] = await Promise.all([
    read(client, { ...rest, abi, address, functionName: 'currency' }),
    read(client, { ...rest, abi, address, functionName: 'decimals' }),
    read(client, { ...rest, abi, address, functionName: 'logoURI' }).catch(
      () => '',
    ),
    read(client, { ...rest, abi, address, functionName: 'quoteToken' }),
    read(client, { ...rest, abi, address, functionName: 'name' }),
    read(client, { ...rest, abi, address, functionName: 'paused' }),
    read(client, { ...rest, abi, address, functionName: 'supplyCap' }),
    read(client, { ...rest, abi, address, functionName: 'symbol' }),
    read(client, { ...rest, abi, address, functionName: 'totalSupply' }),
    read(client, { ...rest, abi, address, functionName: 'transferPolicyId' }),
  ])
  return {
    name,
    symbol,
    currency,
    decimals,
    logoURI,
    quoteToken,
    totalSupply,
    paused,
    supplyCap,
    transferPolicyId,
    ...overrides,
  }
}

export declare namespace getMetadata {
  type Options = Omit<ReadParameters, 'account'> & TokenParameter

  type ReturnType = {
    /** Currency (e.g. "USD"). */
    currency: string
    /** Decimals of the token. */
    decimals: number
    /**
     * Logo URI of the token. Empty string when unset or unsupported by the
     * active Tempo hardfork.
     */
    logoURI: string
    /**
     * Quote token.
     *
     * `undefined` for the default quote token (`0x20c...0000`).
     */
    quoteToken?: Address.Address | undefined
    /** Name of the token. */
    name: string
    /**
     * Whether the token is paused.
     *
     * `undefined` for the default quote token (`0x20c...0000`).
     */
    paused?: boolean | undefined
    /**
     * Supply cap.
     *
     * `undefined` for the default quote token (`0x20c...0000`).
     */
    supplyCap?: bigint | undefined
    /** Symbol of the token. */
    symbol: string
    /** Total supply of the token. */
    totalSupply: bigint
    /**
     * Transfer policy ID.
     * 0="always-reject", 1="always-allow", >2=custom policy
     *
     * `undefined` for the default quote token (`0x20c...0000`).
     */
    transferPolicyId?: bigint | undefined
  }

  type ErrorType = read.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets the total supply of a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const totalSupply = await Actions.token.getTotalSupply(client, {
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token total supply, in base units and human-readable form.
 */
export async function getTotalSupply<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTotalSupply.Options,
): Promise<getTotalSupply.ReturnType> {
  const { decimals, token, ...rest } = options
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getTotalSupply.call(client, { token }),
    } as never),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getTotalSupply {
  export type Args = TokenParameters

  export type Options = Omit<ReadParameters, 'account'> & Args

  export type ReturnType = Amount

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `totalSupply` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, args).address,
      args: [],
      functionName: 'totalSupply',
    } as never)
  }
}

/**
 * Gets the admin role for a specific role in a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const adminRole = await Actions.token.getRoleAdmin(client, {
 *   role: 'issuer',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The admin role hash.
 */
export async function getRoleAdmin<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getRoleAdmin.Options,
): Promise<getRoleAdmin.ReturnType> {
  const { role, token, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getRoleAdmin.call(client, { role, token }),
  } as never)) as getRoleAdmin.ReturnType
}

export namespace getRoleAdmin {
  export type Args = {
    /** Role to get admin for. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<typeof Abis.tip20, 'getRoleAdmin'>

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getRoleAdmin` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role)],
      functionName: 'getRoleAdmin',
    } as never)
  }
}

/**
 * Checks if an account has a specific role for a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const hasRole = await Actions.token.hasRole(client, {
 *   account: '0x…',
 *   role: 'issuer',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the account has the role.
 */
export async function hasRole<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: hasRole.Options,
): Promise<hasRole.ReturnType> {
  const { account: account_ = client.account, role, token, ...rest } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  return (await read(client, {
    ...rest,
    ...hasRole.call(client, { account: address, role, token }),
  } as never)) as hasRole.ReturnType
}

export namespace hasRole {
  export type Args = {
    /** Account address to check. */
    account: Address.Address
    /** Role to check. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = Omit<ReadParameters, 'account'> &
    Omit<Args, 'account'> & {
      /** Account (or address) to check. @default client.account */
      account?: Account.Account | Address.Address | undefined
    }

  export type ReturnType = read.ReturnType<typeof Abis.tip20, 'hasRole'>

  export type ErrorType =
    | Account.NotFoundError
    | read.ErrorType
    | Errors.GlobalErrorType

  /**
   * Defines a call to the `hasRole` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { account, role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [account, TokenRole.serialize(role)],
      functionName: 'hasRole',
    } as never)
  }
}

/**
 * Grants roles for a TIP-20 token.
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
 * const hash = await Actions.token.grantRoles(client, {
 *   roles: ['issuer'],
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function grantRoles<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: grantRoles.Options,
): Promise<grantRoles.ReturnType> {
  return grantRoles.inner(send, client, options)
}

export namespace grantRoles {
  export type Args = {
    /** Role to grant. */
    role: TokenRole.TokenRole
    /** Address to grant the role to. */
    to: Address.Address
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters &
    Omit<Args, 'role'> & {
      /** Roles to grant. */
      roles: readonly TokenRole.TokenRole[]
    }

  export type ReturnType = send.ReturnType

  export type ErrorType = send.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof send | typeof sendSync>(
    action: action,
    client: Client.Client,
    options: grantRoles.Options,
  ): Promise<ActionReturnType<action>> {
    const { roles, to, token, ...rest } = options
    return (await action(client, {
      ...rest,
      calls: roles.map((role) => {
        const call = grantRoles.call(client, { role, to, token })
        return { data: call.data, to: call.to }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `grantRole` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { role, to, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role), to],
      functionName: 'grantRole',
    } as never)
  }

  /** Extracts the `RoleMembershipUpdated` events from logs. */
  export function extractEvents(logs: readonly Log.Log[]) {
    const events = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'RoleMembershipUpdated',
      strict: true,
    })
    if (events.length === 0)
      throw new BaseError('`RoleMembershipUpdated` events not found.')
    return events
  }
}

/**
 * Grants roles for a TIP-20 token, and waits for the transaction to be
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
 * const { receipt, value } = await Actions.token.grantRolesSync(client, {
 *   roles: ['issuer'],
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function grantRolesSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: grantRolesSync.Options,
): Promise<grantRolesSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await grantRoles.inner(sendSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const events = grantRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return {
    receipt,
    value,
  } as never
}

export declare namespace grantRolesSync {
  type Args = grantRoles.Args

  type Options = grantRoles.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: sendSync.ReturnType<chain>
    /** `RoleMembershipUpdated` event data. */
    value: readonly {
      /** Role hash. */
      role: Hex.Hex
      /** Account whose role membership changed. */
      account: Address.Address
      /** Address that performed the update. */
      sender: Address.Address
      /** Whether the account now holds the role. */
      hasRole: boolean
    }[]
  }

  type ErrorType = sendSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Mints TIP-20 tokens to an address.
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
 * const hash = await Actions.token.mint(client, {
 *   amount: 100n,
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function mint<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mint.Options,
): Promise<mint.ReturnType> {
  return mint.inner(write, client, options)
}

export namespace mint {
  export type Args = {
    /** Amount of tokens to mint, in base units or formatted decimal form. */
    amount: AmountInput
    /** Memo to include in the mint. */
    memo?: Hex.Hex | undefined
    /** Address to mint tokens to. */
    to: Address.Address
  } & TokenParameter

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: mint.Options,
  ): Promise<ActionReturnType<action>> {
    const { amount, memo, to, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...mint.call(client, { amount, memo, to, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `mint` (or `mintWithMemo`, when `memo` is given)
   * function. Can be passed to any action that accepts a contract call.
   * `amount.decimals` is inferred from the client's declared `tokens` when
   * omitted.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, memo, to, token } = args
    const { address, decimals } = resolveToken(client, { token })
    const value = toBaseUnits(amount, decimals)
    const callArgs = memo
      ? ({
          args: [to, value, Hex.padLeft(memo, 32)],
          functionName: 'mintWithMemo',
        } as const)
      : ({
          args: [to, value],
          functionName: 'mint',
        } as const)
    return defineCall({
      abi: Abis.tip20,
      address,
      ...callArgs,
    } as never)
  }

  /** Extracts the `Mint` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Mint',
      strict: true,
    })
    if (!log) throw new BaseError('`Mint` event not found.')
    return log
  }
}

/**
 * Mints TIP-20 tokens to an address, and waits for the transaction to be
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
 * const { receipt, ...event } = await Actions.token.mintSync(client, {
 *   amount: 100n,
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function mintSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mintSync.Options,
): Promise<mintSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await mint.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = mint.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace mintSync {
  type Args = mint.Args

  type Options = mint.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address the tokens were minted to. */
    to: Address.Address
    /** Minted amount, in base units. */
    amount: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Pauses a TIP-20 token.
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
 * const hash = await Actions.token.pause(client, { token: '0x…' })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function pause<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: pause.Options,
): Promise<pause.ReturnType> {
  return pause.inner(write, client, options)
}

export namespace pause {
  export type Args = {
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: pause.Options,
  ): Promise<ActionReturnType<action>> {
    const { token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...pause.call(client, { token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `pause` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [],
      functionName: 'pause',
    } as never)
  }

  /** Extracts the `PauseStateUpdate` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'PauseStateUpdate',
      strict: true,
    })
    if (!log) throw new BaseError('`PauseStateUpdate` event not found.')
    return log
  }
}

/**
 * Pauses a TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.pauseSync(client, {
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function pauseSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: pauseSync.Options,
): Promise<pauseSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await pause.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = pause.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace pauseSync {
  type Args = pause.Args

  type Options = pause.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that updated the pause state. */
    updater: Address.Address
    /** Whether the token is paused. */
    isPaused: boolean
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Renounces roles for a TIP-20 token.
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
 * const hash = await Actions.token.renounceRoles(client, {
 *   roles: ['issuer'],
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function renounceRoles<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: renounceRoles.Options,
): Promise<renounceRoles.ReturnType> {
  return renounceRoles.inner(send, client, options)
}

export namespace renounceRoles {
  export type Args = {
    /** Role to renounce. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters &
    Omit<Args, 'role'> & {
      /** Roles to renounce. */
      roles: readonly TokenRole.TokenRole[]
    }

  export type ReturnType = send.ReturnType

  export type ErrorType = send.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof send | typeof sendSync>(
    action: action,
    client: Client.Client,
    options: renounceRoles.Options,
  ): Promise<ActionReturnType<action>> {
    const { roles, token, ...rest } = options
    return (await action(client, {
      ...rest,
      calls: roles.map((role) => {
        const call = renounceRoles.call(client, { role, token })
        return { data: call.data, to: call.to }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `renounceRole` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role)],
      functionName: 'renounceRole',
    } as never)
  }

  /** Extracts the `RoleMembershipUpdated` events from logs. */
  export function extractEvents(logs: readonly Log.Log[]) {
    const events = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'RoleMembershipUpdated',
      strict: true,
    })
    if (events.length === 0)
      throw new BaseError('`RoleMembershipUpdated` events not found.')
    return events
  }
}

/**
 * Renounces roles for a TIP-20 token, and waits for the transaction to be
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
 * const { receipt, value } = await Actions.token.renounceRolesSync(client, {
 *   roles: ['issuer'],
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function renounceRolesSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: renounceRolesSync.Options,
): Promise<renounceRolesSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await renounceRoles.inner(sendSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const events = renounceRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return {
    receipt,
    value,
  } as never
}

export declare namespace renounceRolesSync {
  type Args = renounceRoles.Args

  type Options = renounceRoles.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: sendSync.ReturnType<chain>
    /** `RoleMembershipUpdated` event data. */
    value: readonly {
      /** Role hash. */
      role: Hex.Hex
      /** Account whose role membership changed. */
      account: Address.Address
      /** Address that performed the update. */
      sender: Address.Address
      /** Whether the account now holds the role. */
      hasRole: boolean
    }[]
  }

  type ErrorType = sendSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Revokes roles for a TIP-20 token.
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
 * const hash = await Actions.token.revokeRoles(client, {
 *   from: '0x…',
 *   roles: ['issuer'],
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function revokeRoles<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: revokeRoles.Options,
): Promise<revokeRoles.ReturnType> {
  return revokeRoles.inner(send, client, options)
}

export namespace revokeRoles {
  export type Args = {
    /** Address to revoke the role from. */
    from: Address.Address
    /** Role to revoke. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters &
    Omit<Args, 'role'> & {
      /** Roles to revoke. */
      roles: readonly TokenRole.TokenRole[]
    }

  export type ReturnType = send.ReturnType

  export type ErrorType = send.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof send | typeof sendSync>(
    action: action,
    client: Client.Client,
    options: revokeRoles.Options,
  ): Promise<ActionReturnType<action>> {
    const { from, roles, token, ...rest } = options
    return (await action(client, {
      ...rest,
      calls: roles.map((role) => {
        const call = revokeRoles.call(client, { from, role, token })
        return { data: call.data, to: call.to }
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `revokeRole` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { from, role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role), from],
      functionName: 'revokeRole',
    } as never)
  }

  /** Extracts the `RoleMembershipUpdated` events from logs. */
  export function extractEvents(logs: readonly Log.Log[]) {
    const events = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'RoleMembershipUpdated',
      strict: true,
    })
    if (events.length === 0)
      throw new BaseError('`RoleMembershipUpdated` events not found.')
    return events
  }
}

/**
 * Revokes roles for a TIP-20 token, and waits for the transaction to be
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
 * const { receipt, value } = await Actions.token.revokeRolesSync(client, {
 *   from: '0x…',
 *   roles: ['issuer'],
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function revokeRolesSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: revokeRolesSync.Options,
): Promise<revokeRolesSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await revokeRoles.inner(sendSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const events = revokeRoles.extractEvents(receipt.logs)
  const value = events.map((event) => event.args)
  return {
    receipt,
    value,
  } as never
}

export declare namespace revokeRolesSync {
  type Args = revokeRoles.Args

  type Options = revokeRoles.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: sendSync.ReturnType<chain>
    /** `RoleMembershipUpdated` event data. */
    value: readonly {
      /** Role hash. */
      role: Hex.Hex
      /** Account whose role membership changed. */
      account: Address.Address
      /** Address that performed the update. */
      sender: Address.Address
      /** Whether the account now holds the role. */
      hasRole: boolean
    }[]
  }

  type ErrorType = sendSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Sets the supply cap for a TIP-20 token.
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
 * const hash = await Actions.token.setSupplyCap(client, {
 *   supplyCap: 1000000n,
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setSupplyCap<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setSupplyCap.Options,
): Promise<setSupplyCap.ReturnType> {
  return setSupplyCap.inner(write, client, options)
}

export namespace setSupplyCap {
  export type Args = {
    /** New supply cap. */
    supplyCap: bigint
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: setSupplyCap.Options,
  ): Promise<ActionReturnType<action>> {
    const { supplyCap, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...setSupplyCap.call(client, { supplyCap, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `setSupplyCap` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { supplyCap, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [supplyCap],
      functionName: 'setSupplyCap',
    } as never)
  }

  /** Extracts the `SupplyCapUpdate` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'SupplyCapUpdate',
      strict: true,
    })
    if (!log) throw new BaseError('`SupplyCapUpdate` event not found.')
    return log
  }
}

/**
 * Sets the supply cap for a TIP-20 token, and waits for the transaction to be
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
 * const { receipt, ...event } = await Actions.token.setSupplyCapSync(client, {
 *   supplyCap: 1000000n,
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setSupplyCapSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setSupplyCapSync.Options,
): Promise<setSupplyCapSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await setSupplyCap.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setSupplyCap.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace setSupplyCapSync {
  type Args = setSupplyCap.Args

  type Options = setSupplyCap.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that updated the supply cap. */
    updater: Address.Address
    /** New supply cap. */
    newSupplyCap: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Sets the admin role for a specific role in a TIP-20 token.
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
 * const hash = await Actions.token.setRoleAdmin(client, {
 *   adminRole: 'admin',
 *   role: 'issuer',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setRoleAdmin<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setRoleAdmin.Options,
): Promise<setRoleAdmin.ReturnType> {
  return setRoleAdmin.inner(write, client, options)
}

export namespace setRoleAdmin {
  export type Args = {
    /** New admin role. */
    adminRole: TokenRole.TokenRole
    /** Role to set admin for. */
    role: TokenRole.TokenRole
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: setRoleAdmin.Options,
  ): Promise<ActionReturnType<action>> {
    const { adminRole, role, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...setRoleAdmin.call(client, { adminRole, role, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `setRoleAdmin` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { adminRole, role, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [TokenRole.serialize(role), TokenRole.serialize(adminRole)],
      functionName: 'setRoleAdmin',
    } as never)
  }

  /** Extracts the `RoleAdminUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'RoleAdminUpdated',
      strict: true,
    })
    if (!log) throw new BaseError('`RoleAdminUpdated` event not found.')
    return log
  }
}

/**
 * Sets the admin role for a specific role in a TIP-20 token, and waits for the
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
 * const { receipt, ...event } = await Actions.token.setRoleAdminSync(client, {
 *   adminRole: 'admin',
 *   role: 'issuer',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function setRoleAdminSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setRoleAdminSync.Options,
): Promise<setRoleAdminSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await setRoleAdmin.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = setRoleAdmin.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace setRoleAdminSync {
  type Args = setRoleAdmin.Args

  type Options = setRoleAdmin.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Role whose admin was updated. */
    role: Hex.Hex
    /** New admin role hash. */
    newAdminRole: Hex.Hex
    /** Address that performed the update. */
    sender: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Transfers TIP-20 tokens to another address.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
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
 * const hash = await Actions.token.transfer(client, {
 *   amount: 100n,
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function transfer<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: transfer.Options,
): Promise<transfer.ReturnType> {
  return transfer.inner(write, client, options)
}

export namespace transfer {
  export type Args = {
    /** Amount of tokens to transfer, in base units or formatted decimal form. */
    amount: AmountInput
    /** Address to transfer tokens from (uses an allowance via `transferFrom`). */
    from?: Address.Address | undefined
    /** Memo to include in the transfer. */
    memo?: Hex.Hex | undefined
    /** Address to transfer tokens to. */
    to: Address.Address
  } & TokenParameter

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: transfer.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...transfer.call(client, options),
    } as never)) as never
  }

  /**
   * Defines a call to the `transfer`, `transferFrom`, `transferWithMemo`, or
   * `transferFromWithMemo` function. Can be passed to any action that accepts
   * a contract call. `amount.decimals` is inferred from the client's declared
   * `tokens` when omitted.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { amount, from, memo, to, token } = args
    const { address, decimals } = resolveToken(client, { token })
    const value = toBaseUnits(amount, decimals)
    const callArgs = (() => {
      if (memo && from)
        return {
          args: [from, to, value, Hex.padLeft(memo, 32)],
          functionName: 'transferFromWithMemo',
        } as const
      if (memo)
        return {
          args: [to, value, Hex.padLeft(memo, 32)],
          functionName: 'transferWithMemo',
        } as const
      if (from)
        return {
          args: [from, to, value],
          functionName: 'transferFrom',
        } as const
      return {
        args: [to, value],
        functionName: 'transfer',
      } as const
    })()
    return defineCall({
      abi: Abis.tip20,
      address,
      ...callArgs,
    } as never)
  }

  /**
   * Estimates the gas required to transfer TIP-20 tokens. `amount.decimals` is
   * inferred from the client's declared `tokens` when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: transfer.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...transfer.call(client, options),
    } as never)
  }

  /**
   * Simulates a transfer of TIP-20 tokens. `amount.decimals` is inferred from
   * the client's declared `tokens` when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: transfer.Options,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.tip20,
      'transfer' | 'transferFrom' | 'transferWithMemo' | 'transferFromWithMemo'
    >
  > {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...transfer.call(client, options),
    } as never) as never
  }

  /** Extracts the `Transfer` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Transfer',
      strict: true,
    })
    if (!log) throw new BaseError('`Transfer` event not found.')
    return log
  }
}

/**
 * Transfers TIP-20 tokens to another address, and waits for the transaction to
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
 * const { receipt, ...event } = await Actions.token.transferSync(client, {
 *   amount: 100n,
 *   to: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function transferSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: transferSync.Options,
): Promise<transferSync.ReturnType<chain>> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await transfer.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = transfer.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.amount, resolved) }),
    receipt,
  } as never
}

export declare namespace transferSync {
  type Args = transfer.Args

  type Options = transfer.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address the tokens were transferred from. */
    from: Address.Address
    /** Address the tokens were transferred to. */
    to: Address.Address
    /** Transferred amount, in base units. */
    amount: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Transferred amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Unpauses a TIP-20 token.
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
 * const hash = await Actions.token.unpause(client, { token: '0x…' })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function unpause<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: unpause.Options,
): Promise<unpause.ReturnType> {
  return unpause.inner(write, client, options)
}

export namespace unpause {
  export type Args = {
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: unpause.Options,
  ): Promise<ActionReturnType<action>> {
    const { token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...unpause.call(client, { token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `unpause` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [],
      functionName: 'unpause',
    } as never)
  }

  /** Extracts the `PauseStateUpdate` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'PauseStateUpdate',
      strict: true,
    })
    if (!log) throw new BaseError('`PauseStateUpdate` event not found.')
    return log
  }
}

/**
 * Unpauses a TIP-20 token, and waits for the transaction to be confirmed.
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
 * const { receipt, ...event } = await Actions.token.unpauseSync(client, {
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function unpauseSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: unpauseSync.Options,
): Promise<unpauseSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await unpause.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = unpause.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace unpauseSync {
  type Args = unpause.Args

  type Options = unpause.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that updated the pause state. */
    updater: Address.Address
    /** Whether the token is paused. */
    isPaused: boolean
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Proposes a new quote token for a TIP-20 token.
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
 * const hash = await Actions.token.prepareUpdateQuoteToken(client, {
 *   quoteToken: '0x…',
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function prepareUpdateQuoteToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: prepareUpdateQuoteToken.Options,
): Promise<prepareUpdateQuoteToken.ReturnType> {
  return prepareUpdateQuoteToken.inner(write, client, options)
}

export namespace prepareUpdateQuoteToken {
  export type Args = {
    /** New quote token address. */
    quoteToken: TokenId.TokenIdOrAddress
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: prepareUpdateQuoteToken.Options,
  ): Promise<ActionReturnType<action>> {
    const { quoteToken, token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...prepareUpdateQuoteToken.call(client, { quoteToken, token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `setNextQuoteToken` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { quoteToken, token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [resolveToken(client, { token: quoteToken }).address],
      functionName: 'setNextQuoteToken',
    } as never)
  }

  /** Extracts the `NextQuoteTokenSet` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'NextQuoteTokenSet',
      strict: true,
    })
    if (!log) throw new BaseError('`NextQuoteTokenSet` event not found.')
    return log
  }
}

/**
 * Proposes a new quote token for a TIP-20 token, and waits for the transaction
 * to be confirmed.
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
 * const { receipt, ...event } =
 *   await Actions.token.prepareUpdateQuoteTokenSync(client, {
 *     quoteToken: '0x…',
 *     token: '0x…',
 *   })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function prepareUpdateQuoteTokenSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: prepareUpdateQuoteTokenSync.Options,
): Promise<prepareUpdateQuoteTokenSync.ReturnType<chain>> {
  const receipt = await prepareUpdateQuoteToken.inner(
    writeSync,
    client,
    options,
  )
  const { args } = prepareUpdateQuoteToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace prepareUpdateQuoteTokenSync {
  type Args = prepareUpdateQuoteToken.Args

  type Options = prepareUpdateQuoteToken.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that proposed the quote token update. */
    updater: Address.Address
    /** Proposed quote token address. */
    nextQuoteToken: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Completes a quote token update for a TIP-20 token.
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
 * const hash = await Actions.token.updateQuoteToken(client, {
 *   token: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function updateQuoteToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateQuoteToken.Options,
): Promise<updateQuoteToken.ReturnType> {
  return updateQuoteToken.inner(write, client, options)
}

export namespace updateQuoteToken {
  export type Args = {
    /** Address or ID of the TIP-20 token. */
    token: TokenId.TokenIdOrAddress
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: updateQuoteToken.Options,
  ): Promise<ActionReturnType<action>> {
    const { token, ...rest } = options
    return (await action(client, {
      ...rest,
      ...updateQuoteToken.call(client, { token }),
    } as never)) as never
  }

  /**
   * Defines a call to the `completeQuoteTokenUpdate` function. Can be passed
   * to any action that accepts a contract call.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(client: Client.Client, args: Args) {
    const { token } = args
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [],
      functionName: 'completeQuoteTokenUpdate',
    } as never)
  }

  /** Extracts the `QuoteTokenUpdate` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'QuoteTokenUpdate',
      strict: true,
    })
    if (!log) throw new BaseError('`QuoteTokenUpdate` event not found.')
    return log
  }
}

/**
 * Completes a quote token update for a TIP-20 token, and waits for the
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
 * const { receipt, ...event } = await Actions.token.updateQuoteTokenSync(
 *   client,
 *   { token: '0x…' },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function updateQuoteTokenSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateQuoteTokenSync.Options,
): Promise<updateQuoteTokenSync.ReturnType<chain>> {
  const receipt = await updateQuoteToken.inner(writeSync, client, options)
  const { args } = updateQuoteToken.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export declare namespace updateQuoteTokenSync {
  type Args = updateQuoteToken.Args

  type Options = updateQuoteToken.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Address that completed the quote token update. */
    updater: Address.Address
    /** New quote token address. */
    newQuoteToken: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token approvals, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchApprove(client, { token: '0x…' })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchApprove(
  client: Client.Client,
  options: watchApprove.Options,
): watchApprove.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'Approval',
    strict: true,
  } as never) as watchApprove.ReturnType
}

export declare namespace watchApprove {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<typeof Abis.tip20, 'Approval', true>

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token burns, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchBurn(client, { token: '0x…' })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchBurn(
  client: Client.Client,
  options: watchBurn.Options,
): watchBurn.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'Burn',
    strict: true,
  } as never) as watchBurn.ReturnType
}

export declare namespace watchBurn {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<typeof Abis.tip20, 'Burn', true>

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for new TIP-20 tokens created, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchCreate(client)
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
    abi: Abis.tip20Factory,
    address: Addresses.tip20Factory,
    eventName: 'TokenCreated',
    strict: true,
  } as never) as watchCreate.ReturnType
}

export declare namespace watchCreate {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip20Factory,
    'TokenCreated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token mints, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchMint(client, { token: '0x…' })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchMint(
  client: Client.Client,
  options: watchMint.Options,
): watchMint.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'Mint',
    strict: true,
  } as never) as watchMint.ReturnType
}

export declare namespace watchMint {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<typeof Abis.tip20, 'Mint', true>

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token role admin updates, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchAdminRole(client, { token: '0x…' })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchAdminRole(
  client: Client.Client,
  options: watchAdminRole.Options,
): watchAdminRole.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'RoleAdminUpdated',
    strict: true,
  } as never) as watchAdminRole.ReturnType
}

export declare namespace watchAdminRole {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip20,
    'RoleAdminUpdated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token role membership updates, returning a watcher
 * handle. The `hasRole` event argument indicates whether the role was granted
 * (`true`) or revoked (`false`).
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchRole(client, { token: '0x…' })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchRole(
  client: Client.Client,
  options: watchRole.Options,
): watchRole.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'RoleMembershipUpdated',
    strict: true,
  } as never) as watchRole.ReturnType
}

export declare namespace watchRole {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<
    typeof Abis.tip20,
    'RoleMembershipUpdated',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token transfers, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchTransfer(client, { token: '0x…' })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchTransfer(
  client: Client.Client,
  options: watchTransfer.Options,
): watchTransfer.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'Transfer',
    strict: true,
  } as never) as watchTransfer.ReturnType
}

export declare namespace watchTransfer {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<typeof Abis.tip20, 'Transfer', true>

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/**
 * Watches for TIP-20 token quote token updates, returning a watcher handle.
 * Emits `NextQuoteTokenSet` logs when an update is proposed, and
 * `QuoteTokenUpdate` logs when an update is completed.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.token.watchUpdateQuoteToken(client, {
 *   token: '0x…',
 * })
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The watcher handle.
 */
export function watchUpdateQuoteToken(
  client: Client.Client,
  options: watchUpdateQuoteToken.Options,
): watchUpdateQuoteToken.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: quoteTokenUpdateAbi,
    address: resolveToken(client, { token }).address,
    strict: true,
  } as never) as watchUpdateQuoteToken.ReturnType
}

export declare namespace watchUpdateQuoteToken {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter

  type ReturnType = watchEvent.Watcher<
    typeof quoteTokenUpdateAbi,
    undefined,
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>

/** ABI of the quote token update events. @internal */
const quoteTokenUpdateAbi = [
  AbiEvent.fromAbi(Abis.tip20, 'NextQuoteTokenSet'),
  AbiEvent.fromAbi(Abis.tip20, 'QuoteTokenUpdate'),
] as const
