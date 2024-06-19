import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { Overrides } from './deposit.js'

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
