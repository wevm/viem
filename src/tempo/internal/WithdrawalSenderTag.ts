import { AbiParameters, Hash } from 'ox'
import type { Address, Hex } from 'ox'

/** Derives a withdrawal sender tag from its sender and transaction hash. @internal */
export function from(options: from.Options): Hex.Hex {
  const { sender, transactionHash } = options
  return Hash.keccak256(
    AbiParameters.encodePacked(
      ['address', 'bytes32'],
      [sender, transactionHash],
    ),
  )
}

export declare namespace from {
  type Options = {
    sender: Address.Address
    transactionHash: Hex.Hex
  }
}
