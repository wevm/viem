import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { BundlerRpcSchema } from '../types/eip1193.js'

export type GetSupportedEntryPointsReturnType = readonly Address[]
export type GetSupportedEntryPointsErrorType = ErrorType

/**
 * Returns the EntryPoints that the bundler supports.
 *
 * - Docs: https://viem.sh/erc4337/actions/getSupportedEntryPoints
 *
 * @param client - Client to use
 * @param parameters - {@link GetSupportedEntryPointsParameters}
 * @returns Supported Entry Points. {@link GetSupportedEntryPointsReturnType}
 *
 * @example
 * import { createBundlerClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getSupportedEntryPoints } from 'viem/experimental'
 *
 * const bundlerClient = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const addresses = await getSupportedEntryPoints(bundlerClient)
 */
export function getSupportedEntryPoints(
  client: Client<
    Transport,
    Chain | undefined,
    Account | undefined,
    BundlerRpcSchema
  >,
) {
  return client.request({ method: 'eth_supportedEntryPoints' })
}
