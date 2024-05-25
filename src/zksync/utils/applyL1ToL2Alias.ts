import type { Address } from 'abitype'
import { pad, toHex } from '../../utils/index.js'
import { ADDRESS_MODULO, L1_TO_L2_ALIAS_OFFSET } from '../constants/number.js'

export type ApplyL1ToL2AliasParameters = {
  address: Address
}

export type ApplyL1ToL2AliasReturnType = Address

export function applyL1ToL2Alias(
  parameters: ApplyL1ToL2AliasParameters,
): ApplyL1ToL2AliasReturnType {
  return pad(
    toHex(
      (BigInt(parameters.address) + BigInt(L1_TO_L2_ALIAS_OFFSET)) %
        ADDRESS_MODULO,
    ),
    { size: 20 },
  )
}
