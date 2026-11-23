import type { Address } from 'abitype'
import * as AbiParameters from 'ox/AbiParameters'
import * as Hash from 'ox/Hash'
import type * as Hex from 'ox/Hex'

/** Derives a user withdrawal sender tag. @internal */
export function from(options: from.Options): Hex.Hex {
  const { fallbackNonce, sender, transactionHash } = options
  return Hash.keccak256(
    AbiParameters.encodePacked(
      ['address', 'bytes32', 'uint64'],
      [sender, transactionHash, fallbackNonce],
    ),
  )
}

export declare namespace from {
  type Options = {
    fallbackNonce: bigint
    sender: Address
    transactionHash: Hex.Hex
  }
}
