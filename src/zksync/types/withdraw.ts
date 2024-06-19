import type { Address } from 'abitype'
import type { Overrides } from './deposit.js'
import type { Hex } from '../../types/misc.js'

export type WithdrawTransaction = {
  token: Address
  amount: bigint
  to?: Address
  from?: Address
  bridgeAddress?: Address
  paymasterParams?: PaymasterParams
  overrides?: Overrides
}

export type PaymasterParams = {
  paymaster: Address
  paymasterInput: Hex
}
