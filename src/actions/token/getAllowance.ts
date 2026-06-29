import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { Chain } from '../../types/chain.js'
import { readContract } from '../public/readContract.js'
import {
  type Amount,
  defineCall,
  type ReadParameters,
  resolveToken,
  resolveTokenWithDecimals,
  type TokenParameters,
  toAmount,
} from './internal.js'

/**
 * Gets the ERC-20 allowance a spender has over an account's tokens.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const allowance = await token.getAllowance(client, {
 *   account: '0x...',
 *   spender: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The allowance, in base units and human-readable form.
 */
export async function getAllowance<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getAllowance.Parameters<chain>,
): Promise<getAllowance.ReturnValue> {
  const { account, decimals, spender, token, ...rest } = parameters
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getAllowance.call(client, { account, spender, token } as never),
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token,
    }),
  ])
  return toAmount(amount, resolved)
}

export namespace getAllowance {
  export type Args<chain extends Chain | undefined = Chain | undefined> = {
    /** Account that owns the tokens. */
    account: Address
    /** Spender of the tokens. */
    spender: Address
  } & TokenParameters<chain>
  export type Parameters<chain extends Chain | undefined = Chain | undefined> =
    ReadParameters & Args<chain>
  export type ReturnValue = Amount

  /**
   * Defines a call to the `allowance` function.
   *
   * Can be passed as a parameter to `multicall`, `simulateContract`, or any
   * other action that accepts a contract call. The token is selected by `token`
   * name (resolved from the client's chain `tokens` config) or contract
   * address.
   *
   * @param client - Client.
   * @param args - Arguments.
   * @returns The call.
   */
  export function call<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    args: Args<chain>,
  ) {
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [args.account, args.spender],
    })
  }
}
