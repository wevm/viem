import type { Address } from 'abitype'
import type { Hex } from './misc.js'
import type { OneOf } from './utils.js'

export type StateMapping = Array<{
  slot: Hex
  value: Hex
}>

export type StateOverride = Array<
  {
    address: Address
    balance?: bigint | undefined
    nonce?: number | undefined
    code?: Hex | undefined
  } & OneOf<
    | {
        /** Fake key-value mapping to override all slots in the account storage before executing the call. */
        state?: StateMapping | undefined
      }
    | {
        /** Fake key-value mapping to override individual slots in the account storage before executing the call. */
        stateDiff?: StateMapping | undefined
      }
  >
>
