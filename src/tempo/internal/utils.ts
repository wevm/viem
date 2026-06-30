import type { Abi, AbiStateMutability, Address } from 'abitype'
import { TokenId } from 'ox/tempo'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Token } from '../../tokens/defineToken.js'
import type { Chain, ChainToken } from '../../types/chain.js'
import type {
  ContractFunctionName,
  ContractFunctionParameters,
  ExtractAbiItem,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import { encodeFunctionData } from '../../utils/index.js'
import * as Abis from '../Abis.js'

/**
 * Resolves the token contract `address` and `decimals` from a `token`, which is
 * the name of a token declared on the client's chain `tokens` config, a TIP20
 * token id, or a contract `address`.
 *
 * When `token` is a declared name, the `address` and `decimals` are read from
 * the chain (`decimals` can be overridden via the explicit `decimals`). When
 * `token` is a token id or address, its `decimals` is inferred from the chain
 * when the address matches a declared token, otherwise taken from the explicit
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

  if (typeof token === 'string') {
    const declared = findDeclaredTokenBySymbol(client, token)
    if (declared)
      return {
        address: declared.address,
        decimals: decimals ?? declared.decimals,
      }
  }

  const address = TokenId.toAddress(token as TokenId.TokenIdOrAddress)
  return {
    address,
    decimals: decimals ?? inferDecimals(client, address),
  }
}

export namespace resolveToken {
  export type Parameters = {
    /** Decimals, if provided explicitly. */
    decimals?: number | undefined
    /** Token symbol (declared on the client's `tokens` array), TIP20 token id, or contract address. */
    token: TokenId.TokenIdOrAddress | (string & {})
  }
}

/**
 * Finds the declared {@link ChainToken} on the client's `tokens` array matching
 * `token`, which is either a token symbol, a TIP20 token id, or a contract
 * `address`, resolved for the client's `chain.id`. Returns `undefined` when no
 * declared token matches, or the matching token has no address for the client's
 * chain.
 *
 * @param client - Client.
 * @param token - Token symbol (declared on the client's `tokens` array), TIP20 token id, or contract address.
 * @returns The matching declared token config, or `undefined`.
 */
export function findDeclaredToken(
  client: Client<Transport, Chain | undefined>,
  token: TokenId.TokenIdOrAddress | (string & {}),
): ChainToken | undefined {
  const tokens = client.tokens
  const chainId = client.chain?.id
  if (!tokens || chainId === undefined) return undefined

  if (typeof token === 'string') {
    const declared = findDeclaredTokenBySymbol(client, token)
    if (declared) return declared
  }

  const address = TokenId.toAddress(token as TokenId.TokenIdOrAddress)
  for (const token_ of tokens) {
    const resolved = resolveTokenForChain(token_, chainId)
    if (resolved && isAddressEqual(resolved.address, address)) return resolved
  }
  return undefined
}

/**
 * Finds a declared token by `symbol` (case-insensitively) on the client's
 * `tokens` array, resolved for the client's `chain.id`. @internal
 */
function findDeclaredTokenBySymbol(
  client: Client<Transport, Chain | undefined>,
  symbol: string,
): ChainToken | undefined {
  const tokens = client.tokens
  const chainId = client.chain?.id
  if (!tokens || chainId === undefined) return undefined

  const lowerSymbol = symbol.toLowerCase()
  for (const token of tokens) {
    if (token.symbol?.toLowerCase() === lowerSymbol)
      return resolveTokenForChain(token, chainId)
  }
  return undefined
}

/**
 * Resolves a {@link Token} to a {@link ChainToken} for `chainId`, or
 * `undefined` when the token has no address for `chainId`. @internal
 */
function resolveTokenForChain(
  token: Token,
  chainId: number,
): ChainToken | undefined {
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

/**
 * Infers a token's `decimals` from the client's `tokens` array by matching
 * `address` against each token's address for the client's `chain.id`.
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
      abi: Abis.tip20,
      address,
      functionName: 'decimals',
    }),
  }
}

/**
 * Picks the transaction-override fields shared by Tempo write actions (including
 * Tempo-specific fields), so the action-specific args (`token`, `amount`, `to`,
 * etc.) don't leak into `estimateContractGas` / `simulateContract` requests.
 * @internal
 */
export function pickWriteParameters(parameters: Record<string, unknown>) {
  const {
    account,
    chain,
    feePayer,
    feeToken,
    gas,
    keyAuthorization,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    nonceKey,
    validAfter,
    validBefore,
  } = parameters
  return {
    account,
    chain,
    feePayer,
    feeToken,
    gas,
    keyAuthorization,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    nonceKey,
    validAfter,
    validBefore,
  }
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

/**
 * Normalizes a value into a structured-clone compatible format.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
 * @internal
 */
export function normalizeValue<type>(value: type): type {
  if (Array.isArray(value)) return value.map(normalizeValue) as never
  if (typeof value === 'function') return undefined as never
  if (typeof value !== 'object' || value === null) return value
  if (Object.getPrototypeOf(value) !== Object.prototype)
    try {
      return structuredClone(value)
    } catch {
      return undefined as never
    }

  const normalized: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) normalized[k] = normalizeValue(v)
  return normalized as never
}
