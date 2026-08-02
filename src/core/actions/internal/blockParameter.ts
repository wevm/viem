import { type Block, Hex } from 'ox'

import * as Errors from '../../Errors.js'

/**
 * Resolves a block identifier (number, tag, or EIP-1898 hash) into the wire
 * block selector accepted by JSON-RPC methods that take a block parameter.
 */
export function blockParameter(
  options: blockParameter.Options,
): Hex.Hex | Block.Tag | blockParameter.HashIdentifier {
  const { blockHash, blockNumber, blockTag, requireCanonical } = options

  if (requireCanonical !== undefined && !blockHash)
    throw new RequireCanonicalError()

  if (blockHash)
    return requireCanonical ? { blockHash, requireCanonical } : { blockHash }

  if (typeof blockNumber === 'bigint') return Hex.fromNumber(blockNumber)

  return blockTag ?? 'latest'
}

export declare namespace blockParameter {
  type HashIdentifier = {
    blockHash: Block.Hash
    requireCanonical?: boolean | undefined
  }

  type Options = {
    /** Block hash to identify the block (EIP-1898). */
    blockHash?: Block.Hash | undefined
    /** Block number to identify the block. */
    blockNumber?: bigint | undefined
    /** Block tag to identify the block. */
    blockTag?: Block.Tag | undefined
    /** Whether to error if the `blockHash` is not in the canonical chain. */
    requireCanonical?: boolean | undefined
  }

  /** Mutually-exclusive block identifier accepted by block-scoped actions. */
  type BlockOptions =
    | {
        /** The block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
        blockHash?: undefined
        requireCanonical?: undefined
      }
    | {
        blockNumber?: undefined
        /** The block tag. @default 'latest' */
        blockTag?: Block.Tag | undefined
        blockHash?: undefined
        requireCanonical?: undefined
      }
    | {
        blockNumber?: undefined
        blockTag?: undefined
        /** The block identified by this hash (EIP-1898). */
        blockHash: Block.Hash
        /** Whether to error if the block is not in the canonical chain. */
        requireCanonical?: boolean | undefined
      }
}

/** Thrown when `requireCanonical` is set without a `blockHash`. */
export class RequireCanonicalError extends Errors.BaseError {
  override readonly name = 'BlockParameter.RequireCanonicalError'

  constructor() {
    super('`requireCanonical` can only be provided when `blockHash` is set.')
  }
}
