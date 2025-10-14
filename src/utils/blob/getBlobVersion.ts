import type { ErrorType } from '../../errors/utils.js'
import type { BlobVersion } from './blobsToProofs.js'

export type GetBlobVersionParameters = {
  /** Chain ID to determine blob version for */
  chainId?: number | undefined
  /** Explicit blob version override */
  blobVersion?: BlobVersion | undefined
}

export type GetBlobVersionReturnType = BlobVersion

export type GetBlobVersionErrorType = ErrorType

/**
 * Determines the blob version to use based on chain ID.
 *
 * Sepolia (chain ID 11155111) uses EIP-7594 (PeerDAS).
 * All other chains default to EIP-4844.
 *
 * @param parameters - Chain ID and optional blob version override
 * @returns The blob version to use ('4844' or '7594')
 *
 * @example
 * ```ts
 * import { getBlobVersion } from 'viem'
 *
 * // Sepolia uses EIP-7594
 * const version = getBlobVersion({ chainId: 11155111 })
 * // => '7594'
 *
 * // Other chains use EIP-4844
 * const version2 = getBlobVersion({ chainId: 1 })
 * // => '4844'
 *
 * // Can override with explicit version
 * const version3 = getBlobVersion({ chainId: 11155111, blobVersion: '4844' })
 * // => '4844'
 * ```
 */
export function getBlobVersion(
  parameters: GetBlobVersionParameters = {},
): GetBlobVersionReturnType {
  const { chainId, blobVersion } = parameters

  // If explicit version provided, use it
  if (blobVersion) return blobVersion

  // Sepolia uses EIP-7594
  if (chainId === 11_155_111) return '7594'

  // Default to EIP-4844
  return '4844'
}
