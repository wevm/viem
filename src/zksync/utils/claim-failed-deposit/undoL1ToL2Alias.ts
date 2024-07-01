import type { Address } from 'abitype'
import { toHex } from '../../../utils/index.js'
import { l1ToL2AliasOffset } from '../../../zksync/constants/address.js'
import { ADDRESS_MODULO } from '../../../zksync/constants/number.js'

export type UndoL1ToL2AliasParameters = {
  address: Address
}

export type UndoL1ToL2AliasReturnType = Address

export function undoL1ToL2Alias(
  parameters: UndoL1ToL2AliasParameters,
): UndoL1ToL2AliasReturnType {
  let result = BigInt(parameters.address) - BigInt(l1ToL2AliasOffset)
  if (result < 0n) {
    result += ADDRESS_MODULO
  }
  return toHex(result)
}
