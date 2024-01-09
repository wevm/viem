import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'

export type DepositRequest = {
  /** Gas limit for transaction execution on the L2. */
  gas: bigint
  /** Value in wei to mint (deposit) on the L2. Debited from the caller's L1 balance. */
  mint?: bigint
  /** Value in wei sent with this transaction on the L2. Debited from the caller's L2 balance. */
  value?: bigint
} & (
  | {
      /** Encoded contract method & arguments. */
      data?: Hex
      /** Whether or not this is a contract deployment transaction. */
      isCreation?: false
      /** L2 Transaction recipient. */
      to?: Address
    }
  | {
      /** Contract deployment bytecode. Required for contract deployment transactions. */
      data: Hex
      /** Whether or not this is a contract deployment transaction. */
      isCreation: true
      /** L2 Transaction recipient. Cannot exist for contract deployment transactions. */
      to?: never
    }
)
