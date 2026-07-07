import type { Abi, AbiStateMutability, ExtractAbiFunction } from 'abitype'
import * as AbiFunction from 'ox/AbiFunction'
import * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import * as Value from 'ox/Value'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type { UnionPick } from '../../internal/types.js'
import type {
  ContractFunctionName,
  ContractFunctionParameters,
} from '../internal/contract.js'
import { estimateGas as estimateContractGas } from '../contract/estimateGas.js'
import { read } from '../contract/read.js'
import { simulate as simulateContract } from '../contract/simulate.js'
import type { write } from '../contract/write.js'
import type { writeSync } from '../contract/writeSync.js'
import type { send } from '../transaction/send.js'
import type { sendSync } from '../transaction/sendSync.js'
import { erc20Abi } from './internal/abi.js'

/**
 * Union of symbols of the Client's declared `tokens` whose `addresses` include
 * the Client's `chain.id`. Collapses to `never` when there is no chain mapping
 * (no `tokens`, no `chain`, a widened `chain.id`, or widened token symbols).
 *
 * @internal
 */
export type TokenName<
  chain extends Chain.Chain | undefined,
  tokens extends Token.Tokens | undefined,
> = chain extends { id: infer chainId extends number }
  ? number extends chainId
    ? never
    : tokens extends Token.Tokens
      ? TokenSymbolForChain<tokens[number], chainId>
      : never
  : never

type TokenSymbolForChain<
  token,
  chainId extends number,
> = token extends Token.Token
  ? chainId extends keyof token['addresses']
    ? token['symbol'] extends string
      ? string extends token['symbol']
        ? never
        : Lowercase<token['symbol']>
      : never
    : never
  : never

/**
 * Selects an ERC-20 token by `token`, which is either the symbol of a token
 * declared on the Client's `tokens` array or a contract `address`.
 */
export type TokenParameter<
  chain extends Chain.Chain | undefined,
  tokens extends Token.Tokens | undefined,
> = {
  /**
   * Token to operate on: either the symbol of a token declared on the Client's
   * `tokens` array (with an address for the Client's `chain.id`), or a contract
   * `address`.
   */
  token: TokenName<chain, tokens> | Address.Address
}

export type TokenParameters<
  chain extends Chain.Chain | undefined,
  tokens extends Token.Tokens | undefined,
> = TokenParameter<chain, tokens> & {
  /**
   * Decimals used to convert between base units and the human-readable amount.
   * Inferred from the Client's `tokens` array when `token` matches a declared
   * token; otherwise fetched from the token contract when needed.
   */
  decimals?: number | undefined
}

/**
 * A token amount, expressed both in the token's base units (`amount`) and as a
 * human-readable decimal string (`formatted`, derived from the token's
 * `decimals`).
 */
export type Amount = {
  /** Amount in the token's base units. */
  amount: bigint
  /** Token decimals used to derive `formatted`. */
  decimals: number
  /** Amount formatted as a human-readable decimal string. */
  formatted: string
}

/** A write amount: a base-unit bigint, or an explicit formatted helper. */
export type AmountInput =
  | bigint
  | {
      /** Token decimals used to parse `formatted`. */
      decimals?: number | undefined
      /** Human-readable decimal amount. */
      formatted: string
    }

/**
 * Shapes a base-unit value into an {@link Amount} (base units, `decimals`, and
 * human-readable `formatted` string).
 *
 * @param amount - Amount in base units.
 * @param decimals - Token decimals used to format the amount.
 * @returns The {@link Amount}.
 */
export function toAmount(amount: bigint, decimals: number): Amount {
  return { amount, decimals, formatted: Value.format(amount, decimals) }
}

/**
 * Resolves a write amount to base units.
 *
 * @param amount - Base-unit amount, or formatted helper.
 * @param decimals - Token decimals used to parse formatted amounts.
 * @returns Amount in base units.
 */
export function toBaseUnits(
  amount: AmountInput,
  decimals: number | undefined,
): bigint {
  if (typeof amount === 'bigint') return amount
  const resolved = amount.decimals ?? decimals
  return Value.from(amount.formatted, requireTokenDecimals(resolved))
}

/**
 * Requires resolved token decimals for parsing or formatting amounts.
 *
 * @param decimals - Token decimals.
 * @returns Token decimals.
 * @internal
 */
export function requireTokenDecimals(decimals: number | undefined): number {
  if (decimals === undefined)
    throw new Error(
      'Token decimals are required. Pass `amount.decimals` or select a declared token.',
    )
  return decimals
}

/**
 * Resolves the decimals used for formatting a write amount.
 *
 * @param amount - Base-unit amount, or formatted helper.
 * @param decimals - Token decimals.
 * @returns Token decimals, overridden by the formatted helper when present.
 */
export function resolveAmountDecimals(
  amount: AmountInput,
  decimals: number | undefined,
): number | undefined {
  if (typeof amount === 'bigint') return decimals
  return amount.decimals ?? decimals
}

/**
 * Resolves the token contract `address` and `decimals` from a `token`, which is
 * either the symbol of a token declared on the client's `tokens` array or a
 * contract `address`.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The resolved `address` and `decimals`.
 */
export function resolveToken(
  client: Client.Client,
  parameters: resolveToken.Parameters,
): { address: Address.Address; decimals: number | undefined } {
  const { decimals, token } = parameters

  const declared = findDeclaredToken(client, token)
  if (declared)
    return {
      address: declared.address,
      decimals: decimals ?? declared.decimals,
    }

  if (Address.validate(token, { strict: false }))
    return {
      address: token,
      decimals: decimals ?? inferDecimals(client, token),
    }

  throw new Error(
    `Token "${token}" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.`,
  )
}

export namespace resolveToken {
  export type Parameters = {
    /** Decimals, if provided explicitly. */
    decimals?: number | undefined
    /** Token symbol (declared on the client's `tokens` array) or contract address. */
    token: string
  }
}

/**
 * Finds the declared token on the Client's `tokens` array matching `token`
 * (either a token symbol or contract `address`), resolved to a
 * {@link Token.Resolved} for the Client's `chain.id`. Returns `undefined` when
 * no declared token matches, or the matching token has no address for the
 * Client's chain.
 *
 * @param client - Client.
 * @param token - Token symbol (declared on the client's `tokens` array) or contract address.
 * @returns The matching resolved token config, or `undefined`.
 */
export function findDeclaredToken(
  client: Client.Client,
  token: string,
): Token.Resolved | undefined {
  const tokens = client.tokens
  const chainId = client.chain?.id
  if (!tokens || chainId === undefined) return undefined

  const bySymbol = findTokenBySymbol(tokens, token)
  if (bySymbol) return resolveTokenForChain(bySymbol, chainId)

  if (Address.validate(token, { strict: false }))
    for (const token_ of tokens) {
      const resolved = resolveTokenForChain(token_, chainId)
      if (resolved && Address.isEqual(resolved.address, token)) return resolved
    }
  return undefined
}

/**
 * Resolves a {@link Token.Token} to a {@link Token.Resolved} for `chainId`, or
 * `undefined` when the token has no address for `chainId`. @internal
 */
function resolveTokenForChain(
  token: Token.Token,
  chainId: number,
): Token.Resolved | undefined {
  const address = (token.addresses as Record<number, Address.Address>)[chainId]
  if (!address) return undefined
  return {
    address,
    currency: token.currency,
    decimals: token.decimals,
    name: token.name,
    popular: token.popular,
    symbol: token.symbol,
  }
}

/** Finds a {@link Token.Token} by symbol (case-insensitively). @internal */
function findTokenBySymbol(
  tokens: Token.Tokens,
  symbol: string,
): Token.Token | undefined {
  const lowerSymbol = symbol.toLowerCase()
  for (const token of tokens)
    if (token.symbol?.toLowerCase() === lowerSymbol) return token
  return undefined
}

/**
 * Infers a token's `decimals` from the Client's `tokens` array by matching
 * `address` against each token's address for the Client's `chain.id`.
 * @internal
 */
function inferDecimals(
  client: Client.Client,
  address: Address.Address,
): number | undefined {
  const tokens = client.tokens
  const chainId = client.chain?.id
  if (tokens && chainId !== undefined)
    for (const token of tokens) {
      const resolved = resolveTokenForChain(token, chainId)
      if (resolved && Address.isEqual(resolved.address, address))
        return resolved.decimals
    }
  return undefined
}

/**
 * Resolves token decimals, fetching from the token contract when they are not
 * provided explicitly or declared on the client.
 * @internal
 */
export async function resolveTokenWithDecimals(
  client: Client.Client,
  parameters: resolveToken.Parameters,
): Promise<{ address: Address.Address; decimals: number }> {
  const { address, decimals } = resolveToken(client, parameters)
  if (decimals !== undefined) return { address, decimals }
  return {
    address,
    decimals: await read(client, {
      abi: erc20Abi,
      address,
      functionName: 'decimals',
    }),
  }
}

/**
 * Picks the transaction-override fields shared by write actions, so the
 * action-specific args (`token`, `amount`, `to`, etc.) don't leak into
 * `estimateGas` / `simulate` requests. @internal
 */
export function pickWriteParameters(parameters: Record<string, unknown>) {
  const { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce } =
    parameters
  return { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce }
}

export type ReadParameters = UnionPick<
  read.Options<Abi, string, readonly unknown[]>,
  'account' | 'blockNumber' | 'blockOverrides' | 'blockTag' | 'stateOverride'
>

export type WriteParameters<
  _chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  _account extends Account.Account | undefined = Account.Account | undefined,
> = {
  /** Account (or address) the transaction is sent from. @default client.account */
  account?: Account.Account | Address.Address | undefined
  /** Chain the transaction targets. Pass `null` to skip the current-chain assertion. */
  chain?: Chain.Chain | null | undefined
  /** Gas limit for the transaction. */
  gas?: bigint | Hex.Hex | undefined
  /** Maximum fee per gas. */
  maxFeePerGas?: bigint | Hex.Hex | number | undefined
  /** Maximum priority fee per gas. */
  maxPriorityFeePerGas?: bigint | Hex.Hex | number | undefined
  /** Unique number identifying the transaction. */
  nonce?: bigint | Hex.Hex | undefined
  /** Whether to throw when the transaction receipt reverts. @default true */
  throwOnReceiptRevert?: boolean | undefined
}

export function defineCall<
  const abi extends Abi,
  const functionName extends ContractFunctionName<abi, AbiStateMutability>,
  call extends ContractFunctionParameters<
    abi,
    AbiStateMutability,
    functionName
  >,
>(
  call:
    | call
    | ContractFunctionParameters<abi, AbiStateMutability, functionName>,
): ContractFunctionParameters<
  readonly [ExtractAbiFunction<abi, functionName>],
  AbiStateMutability,
  functionName
> & {
  data: Hex.Hex
  to: Address.Address
} {
  const abiItem = AbiFunction.fromAbi(
    (call as any).abi,
    (call as any).functionName,
    { args: (call as any).args },
  )
  return {
    ...(call as any),
    data: AbiFunction.encodeData(abiItem, (call as any).args),
    to: (call as any).address,
  }
}

/**
 * Dispatches a write action to `write` or `writeSync`.
 *
 * Token actions expose a fixed option shape, while the core contract
 * writes derive their request shape from the Client's `chain`. The two meet here,
 * behind a single localized cast, so action implementations stay cast-free.
 */
export async function dispatchWrite<
  action extends typeof write | typeof writeSync,
>(
  action: action,
  client: Client.Client,
  options: object,
): Promise<dispatchWrite.ReturnType<action>> {
  const fn = action as (
    client: Client.Client,
    options: object,
  ) => Promise<dispatchWrite.ReturnType<action>>
  return await fn(client, options)
}

export declare namespace dispatchWrite {
  type ReturnType<action> = action extends typeof writeSync
    ? writeSync.ReturnType
    : write.ReturnType
}

/**
 * Dispatches a token action's batched transaction to `transaction.send` or
 * `transaction.sendSync` (see {@link dispatchWrite} for the rationale).
 */
export async function dispatchSend<
  action extends typeof send | typeof sendSync,
>(
  action: action,
  client: Client.Client,
  options: object,
): Promise<dispatchSend.ReturnType<action>> {
  const fn = action as (
    client: Client.Client,
    options: object,
  ) => Promise<dispatchSend.ReturnType<action>>
  return await fn(client, options)
}

export declare namespace dispatchSend {
  type ReturnType<action> = action extends typeof sendSync
    ? sendSync.ReturnType
    : send.ReturnType
}

/**
 * Estimates the gas of a token contract write. Bridges the chain-independent
 * fixed option shape into `contract.estimateGas` (see {@link dispatchWrite}).
 */
export async function estimateWrite(
  client: Client.Client,
  options: object,
): Promise<bigint> {
  return estimateContractGas(client, options as estimateContractGas.Options)
}

/**
 * Simulates a token contract write. Bridges the chain-independent token
 * option shape into `contract.simulate` (see {@link dispatchWrite}); the
 * result type is contextually inferred from the caller's return type.
 */
export function simulateWrite<returnType>(
  client: Client.Client,
  options: object,
): Promise<returnType> {
  return simulateContract(
    client,
    options as simulateContract.Options,
  ) as Promise<returnType>
}
