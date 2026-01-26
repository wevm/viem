import type { Hex } from '../../types/misc.js'

/**
 * ERC-8132 gasLimitOverride capability for wallet_getCapabilities response.
 *
 * @see https://github.com/ethereum/ERCs/pull/1485
 */
export type GasLimitOverrideCapability = {
  supported: boolean
}

/**
 * ERC-8132 gasLimitOverride call-level capability for wallet_sendCalls.
 *
 * @see https://github.com/ethereum/ERCs/pull/1485
 */
export type GasLimitOverrideCallCapability = {
  /** Hex-encoded gas limit for the call */
  value: Hex
}
