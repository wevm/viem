import type { Hex } from './misc.js'

export type Withdrawal = {
  address: Hex
  amount: Hex
  index: Hex
  validatorIndex: Hex
}
