import type { Abi, AbiStateMutability, Address } from 'abitype'
import { TokenId } from 'ox/tempo'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain, ChainToken } from '../../types/chain.js'
import type {
  ContractFunctionName,
  ContractFunctionParameters,
  ExtractAbiItem,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { isAddress } from '../../utils/address/isAddress.js'
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
    const declared = findDeclaredTokenByName(client.chain?.tokens, token)
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
    /** Token name (declared on the chain's `tokens` config), TIP20 token id, or contract address. */
    token: TokenId.TokenIdOrAddress | (string & {})
  }
}

/**
 * Finds the declared {@link ChainToken} on the client's chain `tokens` config
 * matching `token`, which is either a token name, a TIP20 token id, or a
 * contract `address`. Returns `undefined` when no declared token matches.
 *
 * @param client - Client.
 * @param token - Token name (declared on the chain's `tokens` config), TIP20 token id, or contract address.
 * @returns The matching declared token config, or `undefined`.
 */
export function findDeclaredToken(
  client: Client<Transport, Chain | undefined>,
  token: TokenId.TokenIdOrAddress | (string & {}),
): ChainToken | undefined {
  const tokens = client.chain?.tokens
  if (!tokens) return undefined
  if (typeof token === 'string') {
    const declared = findDeclaredTokenByName(tokens, token)
    if (declared) return declared
  }
  const address = TokenId.toAddress(token as TokenId.TokenIdOrAddress)
  for (const key in tokens) {
    const declared = tokens[key]!
    if (isAddressEqual(declared.address, address)) return declared
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
      if (isAddress(token.address) && isAddressEqual(token.address, address))
        return token.decimals
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
