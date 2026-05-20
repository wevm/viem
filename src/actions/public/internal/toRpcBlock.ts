import type * as Block from '../../../utils/Block.js'
import * as Hex from '../../../utils/Hex.js'
import { BaseError } from '../../../core/BaseError.js'

export function toRpcBlock(
  options: toRpcBlock.Options = {},
): toRpcBlock.ReturnType {
  const {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    requireCanonical,
  } = options

  if (requireCanonical !== undefined && !blockHash)
    throw new InvalidBlockParameterError()

  if (blockHash)
    return requireCanonical ? { blockHash, requireCanonical } : { blockHash }
  if (blockNumber !== undefined) return Hex.fromNumber(blockNumber)
  return blockTag
}

export declare namespace toRpcBlock {
  type Options =
    | {
        /** Block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
        blockHash?: undefined
        requireCanonical?: undefined
      }
    | {
        blockNumber?: undefined
        /** Block tag. */
        blockTag?: Block.Tag | undefined
        blockHash?: undefined
        requireCanonical?: undefined
      }
    | {
        blockNumber?: undefined
        blockTag?: undefined
        /** Block hash. */
        blockHash: Hex.Hex
        /** Whether the block must be in the canonical chain. */
        requireCanonical?: boolean | undefined
      }

  type ReturnType =
    | Hex.Hex
    | Block.Tag
    | { blockHash: Hex.Hex; requireCanonical?: boolean | undefined }

  type ErrorType = Hex.fromNumber.ErrorType | InvalidBlockParameterError
}

export class InvalidBlockParameterError extends BaseError {
  override name = 'actions.public.InvalidBlockParameterError'

  constructor() {
    super('`requireCanonical` can only be provided when `blockHash` is set.')
  }
}
