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
  type TokenParameters,
  toAmount,
} from './internal.js'

/**
 * Gets the total supply of an ERC-20 token.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc20 } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const totalSupply = await erc20.getTotalSupply(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token total supply, in base units and human-readable form.
 */
export async function getTotalSupply<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getTotalSupply.Parameters<chain>,
): Promise<getTotalSupply.ReturnValue> {
  const { decimals, token, ...rest } = parameters
  const amount = await readContract(client, {
    ...rest,
    ...getTotalSupply.call(client, { token } as never),
  })
  const { decimals: resolved } = resolveToken(client, { decimals, token })
  return toAmount(amount, resolved)
}

export namespace getTotalSupply {
  export type Args<chain extends Chain | undefined = Chain | undefined> =
    TokenParameters<chain>
  export type Parameters<chain extends Chain | undefined = Chain | undefined> =
    Omit<ReadParameters, 'account'> & Args<chain>
  export type ReturnValue = Amount

  /**
   * Defines a call to the `totalSupply` function.
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
      args: [],
      functionName: 'totalSupply',
    })
  }
}
