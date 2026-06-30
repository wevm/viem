import type { Abi, AbiStateMutability, Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { ResolvedToken, Token, Tokens } from '../../tokens/defineToken.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionName,
  ContractFunctionParameters,
  ExtractAbiItem,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { UnionPick } from '../../types/utils.js'
import { isAddress } from '../../utils/address/isAddress.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import { encodeFunctionData } from '../../utils/index.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
import { parseUnits } from '../../utils/unit/parseUnits.js'
import type { ReadContractParameters as viem_ReadContractParameters } from '../public/readContract.js'
import { readContract } from '../public/readContract.js'
import type { WriteContractSyncParameters as viem_WriteContractSyncParameters } from '../wallet/writeContractSync.js'

/**
 * Union of symbols of the Client's declared `tokens` whose `addresses` include
 * the Client's `chain.id`. Collapses to `never` when there is no chain mapping
 * (no `tokens`, no `chain`, a widened `chain.id`, or widened token symbols).
 *
 * @internal
 */
export type TokenName<
  chain extends Chain | undefined,
  tokens extends Tokens | undefined,
> = chain extends { id: infer chainId extends number }
  ? number extends chainId
    ? never
    : tokens extends Tokens
      ? TokenSymbolForChain<tokens[number], chainId>
      : never
  : never

type TokenSymbolForChain<token, chainId extends number> = token extends Token
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
 *
 * When `token` is a declared symbol (or an address that matches a declared
 * token), token metadata is resolved from the Client's `tokens` array.
 */
export type TokenParameter<
  chain extends Chain | undefined,
  tokens extends Tokens | undefined,
> = {
  /**
   * Token to operate on: either the symbol of a token declared on the Client's
   * `tokens` array (with an address for the Client's `chain.id`), or a
   * contract `address`.
   */
  token: TokenName<chain, tokens> | Address
}

export type TokenParameters<
  chain extends Chain | undefined,
  tokens extends Tokens | undefined,
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
  return { amount, decimals, formatted: formatUnits(amount, decimals) }
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
  return parseUnits(amount.formatted, requireTokenDecimals(resolved))
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
 * When `token` is a declared symbol, the `address` and `decimals` are resolved
 * from the Client's `tokens` array for the Client's `chain.id` (`decimals` can
 * be overridden via the explicit `decimals`). When `token` is an address, its
 * `decimals` is inferred from the Client's `tokens` array when the address
 * matches a declared token, otherwise taken from the explicit `decimals`.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The resolved `address` and `decimals`.
 */
export function resolveToken(
  client: Client<Transport, Chain | undefined>,
  parameters: resolveToken.Parameters,
): { address: Address; decimals: number | undefined } {
  const { decimals, token } = parameters

  const declared = findDeclaredToken(client, token)
  if (declared)
    return {
      address: declared.address,
      decimals: decimals ?? declared.decimals,
    }

  if (isAddress(token, { strict: false }))
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
 * (either a token symbol or contract `address`), resolved to a {@link ResolvedToken}
 * for the Client's `chain.id`. Returns `undefined` when no declared token
 * matches, or the matching token has no address for the Client's chain.
 *
 * @param client - Client.
 * @param token - Token symbol (declared on the client's `tokens` array) or contract address.
 * @returns The matching resolved token config, or `undefined`.
 */
export function findDeclaredToken(
  client: Client<Transport, Chain | undefined>,
  token: string,
): ResolvedToken | undefined {
  const tokens = client.tokens
  const chainId = client.chain?.id
  if (!tokens || chainId === undefined) return undefined

  const bySymbol = findTokenBySymbol(tokens, token)
  if (bySymbol) return resolveTokenForChain(bySymbol, chainId)

  if (isAddress(token, { strict: false }))
    for (const token_ of tokens) {
      const resolved = resolveTokenForChain(token_, chainId)
      if (resolved && isAddressEqual(resolved.address, token)) return resolved
    }
  return undefined
}

/**
 * Resolves a {@link Token} to a {@link ResolvedToken} for `chainId`, or
 * `undefined` when the token has no address for `chainId`. @internal
 */
function resolveTokenForChain(
  token: Token,
  chainId: number,
): ResolvedToken | undefined {
  const address = (token.addresses as Record<number, Address>)[chainId]
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

/** Finds a {@link Token} by symbol (case-insensitively) on a `tokens` array. @internal */
function findTokenBySymbol(tokens: Tokens, symbol: string): Token | undefined {
  const lowerSymbol = symbol.toLowerCase()
  for (const token of tokens) {
    if (token.symbol?.toLowerCase() === lowerSymbol) return token
  }
  return undefined
}

/**
 * Infers a token's `decimals` from the Client's `tokens` array by matching
 * `address` against each token's address for the Client's `chain.id`.
 * @internal
 */
function inferDecimals(
  client: Client<Transport, Chain | undefined>,
  address: Address,
): number | undefined {
  const tokens = client.tokens
  const chainId = client.chain?.id
  if (tokens && chainId !== undefined)
    for (const token of tokens) {
      const resolved = resolveTokenForChain(token, chainId)
      if (resolved && isAddressEqual(resolved.address, address))
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
  client: Client<Transport, Chain | undefined>,
  parameters: resolveToken.Parameters,
): Promise<{ address: Address; decimals: number }> {
  const { address, decimals } = resolveToken(client, parameters)
  if (decimals !== undefined) return { address, decimals }
  return {
    address,
    decimals: await readContract(client, {
      abi: erc20Abi,
      address,
      functionName: 'decimals',
    }),
  }
}

/**
 * Picks the transaction-override fields shared by write actions, so the
 * action-specific args (`token`, `amount`, `to`, etc.) don't leak into
 * `estimateContractGas` / `simulateContract` requests. @internal
 */
export function pickWriteParameters(parameters: Record<string, unknown>) {
  const { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce } =
    parameters
  return { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce }
}

export type ReadParameters = Pick<
  viem_ReadContractParameters<never, never, never>,
  'account' | 'blockNumber' | 'blockOverrides' | 'blockTag' | 'stateOverride'
>

export type WriteParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = UnionPick<
  viem_WriteContractSyncParameters<never, never, never, chain, account>,
  | 'account'
  | 'chain'
  | 'gas'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'throwOnReceiptRevert'
>

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
  [ExtractAbiItem<abi, functionName>],
  AbiStateMutability,
  functionName
> & {
  data: Hex
  to: Address
} {
  return {
    ...(call as any),
    data: encodeFunctionData(call as never),
    to: call.address,
  } as const
}
