import * as AbiParameters from 'ox/AbiParameters'
import * as Address from 'ox/Address'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'

const tip20Prefix = '0x20c0'

/** TIP-20 token ID of PathUSD. */
export const pathUsd = 0n

/**
 * Computes the TIP-20 token ID that `Addresses.tip20Factory` assigns to a token
 * created by `sender` with `salt`, without reading the chain.
 *
 * The ID is the first 8 bytes of `keccak256(abi.encode(sender, salt))`.
 *
 * @example
 * ```ts
 * import { TokenIds } from 'viem/tempo'
 *
 * const id = TokenIds.compute({
 *   salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
 *   sender: '0x1234567890123456789012345678901234567890',
 * })
 * const address = TokenIds.toAddress(id)
 * ```
 *
 * @param options - Token creator and salt.
 * @returns The TIP-20 token ID.
 */
export function compute(options: compute.Options): bigint {
  const { salt, sender } = options
  const hash = Hash.keccak256(
    AbiParameters.encode(AbiParameters.from('address, bytes32'), [
      sender,
      salt,
    ]),
  )
  return Hex.toBigInt(Hex.slice(hash, 0, 8))
}

export declare namespace compute {
  type Options = {
    /** Salt passed to `createToken` (32 bytes). */
    salt: Hex.Hex
    /** Address that calls `createToken`. */
    sender: Address.Address
  }
}

/**
 * Returns the TIP-20 token address for a token ID. An address is returned
 * unchanged after it is validated.
 *
 * @example
 * ```ts
 * import { TokenIds } from 'viem/tempo'
 *
 * const address = TokenIds.toAddress(1n)
 * // @log: '0x20c0000000000000000000000000000000000001'
 * ```
 *
 * @param tokenId - TIP-20 token ID or address.
 * @returns The TIP-20 token address.
 */
export function toAddress(tokenId: bigint | Address.Address): Address.Address {
  if (typeof tokenId === 'string') {
    Address.assert(tokenId)
    return tokenId
  }
  return Hex.concat(tip20Prefix, Hex.fromNumber(tokenId, { size: 18 }))
}
