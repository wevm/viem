import type { Address } from 'abitype'
import type { DefaultCapabilitiesSchema } from '../types/capabilities.js'
import type { Hex } from '../types/misc.js'
import type { ExactPartial, OneOf } from '../types/utils.js'
import type { DecodeErrorResultReturnType } from '../utils/index.js'
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
}

export type FillTransactionCapabilities = {
  autoSwap?:
    | {
        calls: readonly { to: Address; data: Hex; value: Hex }[]
        maxIn: SwapAmount
        minOut: SwapAmount
        slippage: number
      }
    | undefined
  balanceDiffs?: Readonly<Record<Address, readonly BalanceDiff[]>> | undefined
  error?:
    | OneOf<
        | (DecodeErrorResultReturnType & {
            data: Hex
            message: string
          })
        | { errorName: 'unknown'; message: string }
      >
    | undefined
  fee?:
    | {
        amount: Hex
        decimals: number
        formatted: string
        symbol: string
      }
    | undefined
  requireFunds?:
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

export type SwapAmount = {
  decimals: number
  formatted: string
  name: string
  symbol: string
  token: Address
  value: Hex
}
