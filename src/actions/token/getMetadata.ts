import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { Chain } from '../../types/chain.js'
import { readContract } from '../public/readContract.js'
import {
  findDeclaredToken,
  type ReadParameters,
  resolveToken,
  type TokenParameters,
} from './internal.js'

/**
 * Gets the metadata (`decimals`, `name`, `symbol`) of an ERC-20 token.
 *
 * Fields declared on the chain's `tokens` config are used as-is; any missing
 * field is fetched from the token contract.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const metadata = await token.getMetadata(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token metadata (`decimals`, `name`, `symbol`).
 */
export async function getMetadata<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getMetadata.Parameters<chain>,
): Promise<getMetadata.ReturnValue> {
  const { decimals, token, ...rest } = parameters
  const { address } = resolveToken(client, { decimals, token })
  const declared = findDeclaredToken(client, token)

  const [decimals_, name, symbol] = await Promise.all([
    decimals ??
      declared?.decimals ??
      readContract(client, {
        ...rest,
        abi: erc20Abi,
        address,
        functionName: 'decimals',
      }),
    declared?.name ??
      readContract(client, {
        ...rest,
        abi: erc20Abi,
        address,
        functionName: 'name',
      }),
    declared?.symbol ??
      readContract(client, {
        ...rest,
        abi: erc20Abi,
        address,
        functionName: 'symbol',
      }),
  ])

  return { decimals: decimals_, name, symbol }
}

export namespace getMetadata {
  export type Args<chain extends Chain | undefined = Chain | undefined> =
    TokenParameters<chain>
  export type Parameters<chain extends Chain | undefined = Chain | undefined> =
    Omit<ReadParameters, 'account'> & Args<chain>
  export type ReturnValue = {
    /** Number of decimals the token uses. */
    decimals: number
    /** Human-readable name of the token. */
    name: string
    /** Ticker symbol of the token. */
    symbol: string
  }
}
