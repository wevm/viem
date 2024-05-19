import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { pad, toHex } from '../../utils/index.js'
import { ADDRESS_MODULO, L1_TO_L2_ALIAS_OFFSET } from '../constants/number.js'

export function applyL1ToL2Alias(address: Address): Hex {
  return pad(
    toHex((BigInt(address) + BigInt(L1_TO_L2_ALIAS_OFFSET)) % ADDRESS_MODULO),
    { size: 20 },
  )
}
