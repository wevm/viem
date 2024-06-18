import type { Address } from 'abitype'
import type { Overrides } from './deposit.js'

export type WithdrawTransaction = {
  token: Address
  amount: BigInt
  to?: Address
  from?: Address
  bridgeAddress?: Address
  paymasterParams?: any
  overrides?: Overrides
}
