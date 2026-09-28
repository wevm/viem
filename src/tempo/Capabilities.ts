import type { Address } from 'abitype'
import type { DefaultCapabilitiesSchema } from '../types/capabilities.js'
import type { Hex } from '../types/misc.js'
import type { ExactPartial } from '../types/utils.js'
import type * as ExecutionError from './ExecutionError.js'
import type { TransactionRequestTempo } from './Transaction.js'

export type Schema = Omit<DefaultCapabilitiesSchema, 'sendCalls'> & {
  fillTransaction: {
    Request: FillTransactionRequestCapabilities
    ReturnType: FillTransactionCapabilities
  }
  sendCalls: {
    Request: ExactPartial<TransactionRequestTempo>
  }
}

export type FillTransactionRequestCapabilities = {
  /** Whether to include `balanceDiffs` in the response. */
  balanceDiffs?: boolean | undefined
  /** Whether execution reverts return error capabilities instead of throwing. */
  errors?: boolean | undefined
}

export type FillTransactionCapabilities = {
  balanceDiffs?: Readonly<Record<Address, readonly BalanceDiff[]>> | undefined
  error?: ExecutionError.Rpc | undefined
  fee?:
    | {
        amount: Hex
        decimals: number
        formatted: string
        symbol: string
      }
    | undefined
  insufficientFunds?:
    | {
        amount: Hex
        decimals: number
        formatted: string
        token: Address
        symbol: string
      }
    | undefined
  sponsor?:
    | {
        address: Address
        name?: string | undefined
        url?: string | undefined
      }
    | undefined
  sponsored?: boolean | undefined
  /** Virtual-address resolutions keyed by lowercase literal virtual address. */
  virtualAddresses?: Readonly<Record<Address, Address | null>> | undefined
}

export type BalanceDiff = {
  address: Address
  decimals: number
  direction: 'incoming' | 'outgoing'
  formatted: string
  name: string
  recipients: readonly Address[]
  symbol: string
  value: Hex
}
