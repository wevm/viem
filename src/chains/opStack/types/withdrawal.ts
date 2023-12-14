import type { Hex } from '../../../types/misc.js'

export type Withdrawal = {
  nonce: bigint
  sender: Hex
  target: Hex
  value: bigint
  gasLimit: bigint
  data: Hex
  withdrawalHash: Hex
}
