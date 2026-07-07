import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as TokenId from 'ox/tempo/TokenId'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { multicall } from '../../../core/actions/multicall.js'
import {
  defineCall,
  findDeclaredToken,
} from '../../../core/actions/token/internal.js'
import type { Compute } from '../../../core/internal/types.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters, TokenParameter } from '../../internal/types.js'
import { resolveToken } from '../../internal/utils.js'

/**
 * Gets TIP-20 token metadata including name, symbol, logo URI, currency,
 * decimals, and total supply.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const metadata = await Actions.token.getMetadata(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token metadata.
 */
export async function getMetadata<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getMetadata.Options,
): Promise<getMetadata.ReturnType> {
  const { blockNumber, blockTag, token, ...restOptions } = options
  // `blockNumber`/`blockTag` are mutually exclusive on the multicall options.
  const rest = {
    ...restOptions,
    ...(blockNumber != null
      ? { blockNumber }
      : blockTag != null
        ? { blockTag }
        : {}),
  }
  const { address } = resolveToken(client, { token })
  const abi = Abis.tip20

  const declared = findDeclaredToken(client, address)
  const overrides = {
    ...(declared?.decimals != null ? { decimals: declared.decimals } : {}),
    ...(declared?.name != null ? { name: declared.name } : {}),
    ...(declared?.symbol != null ? { symbol: declared.symbol } : {}),
  }

  if (TokenId.fromAddress(address) === TokenId.fromAddress(Addresses.pathUsd)) {
    const { results } = await multicall(client, {
      ...rest,
      calls: [
        defineCall({ address, abi, functionName: 'currency' }),
        defineCall({ address, abi, functionName: 'decimals' }),
        defineCall({ address, abi, functionName: 'logoURI' }),
        defineCall({ address, abi, functionName: 'name' }),
        defineCall({ address, abi, functionName: 'symbol' }),
        defineCall({ address, abi, functionName: 'totalSupply' }),
      ] as const,
      allowFailure: true,
      deployless: true,
    })
    const [currency, decimals, logoURI, name, symbol, totalSupply] = results
    return {
      name: unwrapMulticallResult(name),
      symbol: unwrapMulticallResult(symbol),
      currency: unwrapMulticallResult(currency),
      decimals: unwrapMulticallResult(decimals),
      logoURI: unwrapMulticallResult(logoURI, ''),
      totalSupply: unwrapMulticallResult(totalSupply),
      ...overrides,
    } as getMetadata.ReturnType
  }

  const { results } = await multicall(client, {
    ...rest,
    calls: [
      defineCall({ address, abi, functionName: 'currency' }),
      defineCall({ address, abi, functionName: 'decimals' }),
      defineCall({ address, abi, functionName: 'logoURI' }),
      defineCall({ address, abi, functionName: 'quoteToken' }),
      defineCall({ address, abi, functionName: 'name' }),
      defineCall({ address, abi, functionName: 'paused' }),
      defineCall({ address, abi, functionName: 'supplyCap' }),
      defineCall({ address, abi, functionName: 'symbol' }),
      defineCall({ address, abi, functionName: 'totalSupply' }),
      defineCall({ address, abi, functionName: 'transferPolicyId' }),
    ] as const,
    allowFailure: true,
    deployless: true,
  })
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
  ] = results
  return {
    name: unwrapMulticallResult(name),
    symbol: unwrapMulticallResult(symbol),
    currency: unwrapMulticallResult(currency),
    decimals: unwrapMulticallResult(decimals),
    logoURI: unwrapMulticallResult(logoURI, ''),
    quoteToken: unwrapMulticallResult(quoteToken),
    totalSupply: unwrapMulticallResult(totalSupply),
    paused: unwrapMulticallResult(paused),
    supplyCap: unwrapMulticallResult(supplyCap),
    transferPolicyId: unwrapMulticallResult(transferPolicyId),
    ...overrides,
  } as getMetadata.ReturnType
}

export namespace getMetadata {
  export type Options = Omit<ReadParameters, 'account'> & TokenParameter
  export type ReturnType = Compute<{
    /** Currency (e.g. "USD"). */
    currency: string
    /** Decimals of the token. */
    decimals: number
    /** Logo URI of the token. Returns an empty string if unset or unsupported by the active Tempo hardfork. */
    logoURI: string
    /** Name of the token. */
    name: string
    /** Whether the token is paused. Returns `undefined` for the default quote token (`0x20c...0000`). */
    paused?: boolean | undefined
    /** Quote token. Returns `undefined` for the default quote token (`0x20c...0000`). */
    quoteToken?: Address.Address | undefined
    /** Supply cap. Returns `undefined` for the default quote token (`0x20c...0000`). */
    supplyCap?: bigint | undefined
    /** Symbol of the token. */
    symbol: string
    /** Total supply of the token. */
    totalSupply: bigint
    /** Transfer policy ID. 0="always-reject", 1="always-allow", >2=custom policy. Returns `undefined` for the default quote token (`0x20c...0000`). */
    transferPolicyId?: bigint | undefined
  }>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

function unwrapMulticallResult<result>(
  response:
    | { result: result; status: 'success' }
    | { error: unknown; status: 'failure' }
    | undefined,
): result
function unwrapMulticallResult<result>(
  response:
    | { result: result; status: 'success' }
    | { error: unknown; status: 'failure' }
    | undefined,
  fallback: result,
): result
function unwrapMulticallResult<result>(
  response:
    | { result: result; status: 'success' }
    | { error: unknown; status: 'failure' }
    | undefined,
  ...fallback: [] | [result]
) {
  if (!response || response.status === 'failure') {
    if (fallback.length > 0) return fallback[0]
    throw response?.error
  }
  return response.result
}
