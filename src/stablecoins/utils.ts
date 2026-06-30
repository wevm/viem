import { type UsdcChainId, usdcAddresses } from './usdc.js'

/**
 * Returns the native USDC contract address for a given chain id.
 *
 * Accepts only chain ids with a known native USDC deployment, so passing an
 * unsupported chain is a compile-time error.
 *
 * @example
 * ```ts
 * import { base } from 'viem/chains'
 * import { getUsdcAddress } from 'viem/stablecoins'
 *
 * const address = getUsdcAddress(base.id)
 * // '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
 * ```
 */
export function getUsdcAddress<chainId extends UsdcChainId>(chainId: chainId) {
  return usdcAddresses[chainId]
}
