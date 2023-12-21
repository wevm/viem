import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'

export type WithdrawalRequest = {
  /** Encoded contract method & arguments. */
  data?: Hex
  /** Gas limit for transaction execution on the L1. */
  gas: bigint
  /** L1 Transaction recipient. */
  to: Address
  /** Value in wei to withdrawal to the L1. Debited from the caller's L2 balance. */
  value?: bigint
}

export type Withdrawal = {
  nonce: bigint
  sender: Hex
  target: Hex
  value: bigint
  gasLimit: bigint
  data: Hex
  withdrawalHash: Hex
}
