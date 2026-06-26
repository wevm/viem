import * as Addresses from './Addresses.js'
import * as Decorators from './decorators/index.js'

/**
 * USDC token client decorator. Attaches a `usdc`
 * namespace to a client via `extend`, with the contract address resolved
 * per-chain from the connected client.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { usdc } from 'viem/tokens'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(usdc())
 *
 * const balance = await client.usdc.getBalance({ account: '0x...' })
 *
 * // `amount` accepts a human-readable string (parsed with USDC's 6 decimals).
 * await client.usdc.transferSync({ amount: '10.5', to: '0x...' })
 * ```
 */
export const usdc = Decorators.defineErc20('usdc', {
  addresses: Addresses.usdc,
  decimals: 6,
})
