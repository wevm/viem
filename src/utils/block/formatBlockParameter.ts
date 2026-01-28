import { BaseError, type BaseErrorType } from '../../errors/base.js'
import type { BlockTag } from '../../types/block.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcBlockIdentifier } from '../../types/rpc.js'
import type { NumberToHexErrorType } from '../encoding/toHex.js'
import { numberToHex } from '../encoding/toHex.js'

export type FormatBlockParameterParameters = {
  blockHash?: Hash | undefined
  blockNumber?: bigint | undefined
  blockTag?: BlockTag | undefined
  requireCanonical?: boolean | undefined
}

export type RpcBlockHashIdentifier = Extract<
  RpcBlockIdentifier,
  { blockHash: Hash }
>

export type FormatBlockParameterReturnType =
  | Hex
  | BlockTag
  | RpcBlockHashIdentifier

export type FormatBlockParameterErrorType = BaseErrorType | NumberToHexErrorType

/**
 * Formats block parameters for RPC calls according to EIP-1898.
 *
 * @param parameters - Block parameters
 * @returns Formatted block parameter for RPC call
 *
 * @example
 * // Using block tag
 * formatBlockParameter({ blockTag: 'latest' })
 * // => 'latest'
 *
 * @example
 * // Using block number
 * formatBlockParameter({ blockNumber: 69420n })
 * // => '0x10f2c'
 *
 * @example
 * // Using block hash (EIP-1898)
 * formatBlockParameter({ blockHash: '0x...' })
 * // => { blockHash: '0x...' }
 *
 * @example
 * // Using block hash with requireCanonical (EIP-1898)
 * formatBlockParameter({ blockHash: '0x...', requireCanonical: true })
 * // => { blockHash: '0x...', requireCanonical: true }
 */
export function formatBlockParameter(
  parameters: FormatBlockParameterParameters,
): FormatBlockParameterReturnType {
  const { blockHash, blockNumber, blockTag, requireCanonical } = parameters

  if (requireCanonical !== undefined && !blockHash)
    throw new BaseError(
      '`requireCanonical` can only be provided when `blockHash` is set.',
    )

  if (blockHash) {
    return requireCanonical ? { blockHash, requireCanonical } : { blockHash }
  }

  if (typeof blockNumber === 'bigint') {
    return numberToHex(blockNumber)
  }

  return blockTag ?? 'latest'
}
