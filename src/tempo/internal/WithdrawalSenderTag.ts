import type { Address } from 'abitype'
import { AbiParameters, Hash, type Hex } from 'ox'

/** Derives a withdrawal sender tag. @internal */
export function from(options: from.Options): Hex.Hex {
  const { fallbackNonce, sender, transactionHash } = options
  if (
    sender === '0x0000000000000000000000000000000000000000' &&
    fallbackNonce === 0n
  )
    return Hash.keccak256(
      AbiParameters.encodePacked(
        ['address', 'bytes32'],
        [
          sender,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ],
      ),
    )
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
