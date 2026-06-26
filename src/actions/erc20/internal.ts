import type { Abi, AbiStateMutability, Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
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
import type { ReadContractParameters as viem_ReadContractParameters } from '../public/readContract.js'
import type { WriteContractSyncParameters as viem_WriteContractSyncParameters } from '../wallet/writeContractSync.js'

/**
 * Union of ERC-20 token names declared on `chain`'s `tokens` config (tokens
 * whose `type` is `'erc20'`).
 */
export type Erc20TokenName<chain extends Chain | undefined> = chain extends {
  tokens: infer tokens extends Record<string, ChainToken>
}
  ? {
      [name in keyof tokens]: tokens[name] extends { type: 'erc20' }
        ? name
        : never
    }[keyof tokens]
  : never

/**
 * Selects an ERC-20 token by `token`, which is either the name of a token
 * declared on the chain's `tokens` config or a contract `address`.
 *
 * When `token` is a declared name (or an address that matches a declared
 * token), `decimals` is resolved from the chain's `tokens` config. When `token`
 * is an undeclared address, `decimals` is taken from the explicit `decimals`
 * value, defaulting to `0` when omitted.
 */
export type TokenParameters<chain extends Chain | undefined> = {
  /**
   * Decimals used to convert between base units and the human-readable amount.
   * Inferred from the chain's `tokens` config when `token` matches a declared
   * token; otherwise defaults to `0`.
   */
  decimals?: number | undefined
  /**
   * Token to operate on: either the name of a token declared on the chain's
   * `tokens` config, or a contract `address`.
   */
  token: Erc20TokenName<chain> | Address
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
 * Resolves the token contract `address` and `decimals` from a `token`, which is
 * either the name of a token declared on the client's chain `tokens` config or
 * a contract `address`.
 *
 * When `token` is a declared name, the `address` and `decimals` are read from
 * the chain (`decimals` can be overridden via the explicit `decimals`). When
 * `token` is an address, its `decimals` is inferred from the chain when the
 * address matches a declared token, otherwise taken from the explicit
 * `decimals`, defaulting to `0`.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The resolved `address` and `decimals`.
 */
export function resolveToken(
  client: Client<Transport, Chain | undefined>,
  parameters: resolveToken.Parameters,
): { address: Address; decimals: number } {
  const { decimals, token } = parameters

  const declared = client.chain?.tokens?.[token]
  if (declared) {
    if (declared.type !== 'erc20')
      throw new Error(
        `Token "${token}" is not an ERC-20 token on the chain's \`tokens\` config.`,
      )
    return {
      address: declared.address,
      decimals: decimals ?? declared.decimals,
    }
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
 * Infers a token's `decimals` from the client's chain `tokens` config by
 * matching `address`, defaulting to `0` when no declared token matches.
 * @internal
 */
function inferDecimals(
  client: Client<Transport, Chain | undefined>,
  address: Address,
): number {
  const tokens = client.chain?.tokens
  if (tokens)
    for (const key in tokens) {
      const token = tokens[key]!
      if (isAddressEqual(token.address, address)) return token.decimals
    }
  return 0
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
