import * as Hex from 'ox/Hex'
import { blockHashHistory as address } from './Addresses.js'

export { address }

/** Encodes a block number for the selectorless EIP-2935 history contract. */
export function encodeInput(blockNumber: bigint | number): Hex.Hex {
  const value = BigInt(blockNumber)
  if (value < 0n) throw new RangeError('Block number must be non-negative.')
  return Hex.fromNumber(value, { size: 32 })
}

/** Decodes selectorless EIP-2935 calldata into a block number. */
export function decodeInput(data: Hex.Hex): bigint {
  if (Hex.size(data) !== 32)
    throw new RangeError('Block hash history input must be 32 bytes.')
  return Hex.toBigInt(data)
}

/** Decodes the EIP-2935 return value into a block hash. */
export function decodeOutput(data: Hex.Hex): Hex.Hex {
  if (Hex.size(data) !== 32)
    throw new RangeError('Block hash history output must be 32 bytes.')
  return data
}
