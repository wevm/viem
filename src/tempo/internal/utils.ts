import type * as Address from 'ox/Address'
import * as TokenId from 'ox/tempo/TokenId'

import type * as Client from '../../core/Client.js'
import { read } from '../../core/actions/contract/read.js'
import {
  findDeclaredToken,
  resolveToken as resolveErc20Token,
} from '../../core/actions/token/internal.js'
import * as Abis from '../Abis.js'

export { defineCall } from '../../core/actions/token/internal.js'

/**
 * Resolves the token contract `address` and `decimals` from a `token`, which
 * is a token symbol declared on the client's `tokens` array, a TIP-20 token
 * id, or a contract `address`.
 *
 * When `token` is a declared symbol, the `address` and `decimals` are read
 * from the client's declared `tokens` (`decimals` can be overridden via the
 * explicit `decimals`). When `token` is a token id or address, its `decimals`
 * is inferred from the client's declared `tokens` when the address matches a
 * declared token, otherwise taken from the explicit `decimals`.
 *
 * When `client` is omitted, `token` must be a token id or address (symbols
 * cannot be resolved), and `decimals` is only taken from the explicit
 * `decimals`.
 */
export function resolveToken(
  client: Client.Client | undefined,
  parameters: resolveToken.Parameters,
): { address: Address.Address; decimals: number | undefined } {
  const { decimals, token } = parameters

  // Symbols resolve through the client's declared tokens.
  if (client && typeof token === 'string' && !token.startsWith('0x'))
    return resolveErc20Token(client, { decimals, token })

  const address = TokenId.toAddress(token as TokenId.TokenIdOrAddress)
  const declared = client ? findDeclaredToken(client, address) : undefined
  return { address, decimals: decimals ?? declared?.decimals }
}

export declare namespace resolveToken {
  type Parameters = {
    /** Decimals, if provided explicitly. */
    decimals?: number | undefined
    /** Token symbol (declared on the client's `tokens` array), TIP-20 token id, or contract address. */
    token: TokenId.TokenIdOrAddress | (string & {})
  }
}

/**
 * Resolves token decimals, fetching from the token contract when they are not
 * provided explicitly or declared on the client's `tokens` array.
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
      abi: Abis.tip20,
      address,
      functionName: 'decimals',
    }),
  }
}

/**
 * Parameters of an action's `.call` builder: the call arguments, optionally
 * preceded by a Client. The Client is used to resolve token symbols declared
 * on its `tokens` array and to infer token `decimals`. When the Client is
 * omitted, `token` must be a TIP-20 token id or contract `address`, and
 * formatted `amount` values must carry explicit `decimals`.
 */
export type CallParameters<
  args,
  client extends Client.Client = Client.Client,
  // Note: mutable (non-`readonly`) tuples, so bound decorator helpers can
  // pattern-match these parameters.
> = [client: client, args: args] | [args: args]

/**
 * Splits {@link CallParameters} into `[client, args]`, with an `undefined`
 * client when the caller omitted it.
 */
export function resolveCallParameters<args, client extends Client.Client>(
  parameters: CallParameters<args, client>,
): readonly [client: client | undefined, args: args] {
  if (parameters.length === 2) return parameters
  return [undefined, parameters[0]]
}

/**
 * Picks the transaction-override fields shared by Tempo write actions
 * (including Tempo-specific fields), so action-specific args (`token`,
 * `amount`, `to`, etc.) don't leak into gas-estimation or simulation requests.
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
