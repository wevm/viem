import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'

export type DepositRequest = {
  /** Gas limit for transaction execution on the L2. */
  gas: bigint
  /** Value in wei to mint (deposit) on the L2. Debited from the caller's L1 balance. */
  mint?: bigint | undefined
  /** Value in wei sent with this transaction on the L2. Debited from the caller's L2 balance. */
  value?: bigint | undefined
} & (
  | {
      /** Encoded contract method & arguments. */
      data?: Hex | undefined
      /** Whether or not this is a contract deployment transaction. */
      isCreation?: false | undefined
      /** L2 Transaction recipient. */
      to?: Address | undefined
    }
  | {
      /** Contract deployment bytecode. Required for contract deployment transactions. */
      data: Hex
      /** Whether or not this is a contract deployment transaction. */
      isCreation: true
      /** L2 Transaction recipient. Cannot exist for contract deployment transactions. */
      to?: undefined
    }
)
