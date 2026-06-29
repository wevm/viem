import type { Abi, AbiStateMutability, Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { Chain, ChainToken } from '../../types/chain.js'
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
 * Union of token names declared on `chain`'s `tokens` config.
 *
 * @internal
 */
export type TokenName<chain extends Chain | undefined> = chain extends {
  tokens: infer tokens extends Record<string, ChainToken>
}
  ? {
      [name in keyof tokens]: name
    }[keyof tokens]
  : never

/**
 * Selects an ERC-20 token by `token`, which is either the name of a token
 * declared on the chain's `tokens` config or a contract `address`.
 *
 * When `token` is a declared name (or an address that matches a declared
 * token), token metadata is resolved from the chain's `tokens` config.
 */
export type TokenParameter<chain extends Chain | undefined> = {
  /**
   * Token to operate on: either the name of a token declared on the chain's
   * `tokens` config, or a contract `address`.
   */
  token: TokenName<chain> | Address
}

export type TokenParameters<chain extends Chain | undefined> =
  TokenParameter<chain> & {
    /**
     * Decimals used to convert between base units and the human-readable amount.
     * Inferred from the chain's `tokens` config when `token` matches a declared
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
      'Token decimals are required. Pass `amount.decimals` or declare the token on the chain.',
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
 * either the name of a token declared on the client's chain `tokens` config or
 * a contract `address`.
 *
 * When `token` is a declared name, the `address` and `decimals` are read from
 * the chain (`decimals` can be overridden via the explicit `decimals`). When
 * `token` is an address, its `decimals` is inferred from the chain when the
 * address matches a declared token, otherwise taken from the explicit
 * `decimals`.
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

  const declared = findDeclaredTokenByName(client.chain?.tokens, token)
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
    `Token "${token}" is not a declared ERC-20 token on the chain's \`tokens\` config, and is not a valid address.`,
  )
}

export namespace resolveToken {
  export type Parameters = {
    /** Decimals, if provided explicitly. */
    decimals?: number | undefined
    /** Token name (declared on the chain's `tokens` config) or contract address. */
    token: string
  }
}

/**
 * Finds the declared {@link ChainToken} on the client's chain `tokens` config
 * matching `token`, which is either a token name or a contract `address`.
 * Returns `undefined` when no declared token matches.
 *
 * @param client - Client.
 * @param token - Token name (declared on the chain's `tokens` config) or contract address.
 * @returns The matching declared token config, or `undefined`.
 */
export function findDeclaredToken(
  client: Client<Transport, Chain | undefined>,
  token: string,
): ChainToken | undefined {
  const tokens = client.chain?.tokens
  if (!tokens) return undefined
  const declared = findDeclaredTokenByName(tokens, token)
  if (declared) return declared
  if (isAddress(token, { strict: false }))
    for (const key in tokens) {
      const declared = tokens[key]!
      if (isAddressEqual(declared.address, token)) return declared
    }
  return undefined
}

function findDeclaredTokenByName(
  tokens: Record<string, ChainToken> | undefined,
  name: string,
) {
  if (!tokens) return undefined
  if (tokens[name]) return tokens[name]
  const lowerName = name.toLowerCase()
  if (tokens[lowerName]) return tokens[lowerName]
  for (const key in tokens) {
    if (key.toLowerCase() === lowerName) return tokens[key]
  }
  return undefined
}

/**
 * Infers a token's `decimals` from the client's chain `tokens` config by
 * matching `address`.
 * @internal
 */
function inferDecimals(
  client: Client<Transport, Chain | undefined>,
  address: Address,
): number | undefined {
  const tokens = client.chain?.tokens
  if (tokens)
    for (const key in tokens) {
      const token = tokens[key]!
      if (isAddressEqual(token.address, address)) return token.decimals
    }
  return undefined
}

/**
 * Resolves token decimals, fetching from the token contract when they are not
 * provided explicitly or declared on the chain.
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
