import type { Address } from 'abitype'
import type { Overrides } from './deposit.js'
import type { PaymasterParams } from './withdraw.js'

export type TransferTransaction = {
  to: Address
  amount: bigint
  from?: Address
  token?: Address
  paymasterParams?: PaymasterParams
  overrides?: Overrides
}
