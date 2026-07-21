import type { Address } from 'abitype'
import * as AbiParameters from 'ox/AbiParameters'
import * as Hash from 'ox/Hash'
import type { Hex } from '../../types/misc.js'

/** @internal */
export function getWithdrawalSenderTag(parameters: {
  sender: Address
  transactionHash: Hex
}): Hex {
  const { sender, transactionHash } = parameters
  return Hash.keccak256(
    AbiParameters.encodePacked(
      ['address', 'bytes32'],
      [sender, transactionHash],
    ),
  )
}
