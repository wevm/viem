import type { Address } from 'abitype'
import { AbiParameters, Hash, type Hex } from 'ox'

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
