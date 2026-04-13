import type { Address } from 'abitype'
import type { DefaultCapabilitiesSchema } from '../types/capabilities.js'
import type { Hex } from '../types/misc.js'
import type { ExactPartial } from '../types/utils.js'
import type { TransactionRequestTempo } from './Transaction.js'

export type Schema = Omit<DefaultCapabilitiesSchema, 'sendCalls'> & {
  fillTransaction: {
    ReturnType: FillTransactionCapabilities
  }
  sendCalls: {
    Request: ExactPartial<TransactionRequestTempo>
  }
}

export type FillTransactionCapabilities = {
  autoSwap?:
    | {
        maxIn: SwapAmount
        minOut: SwapAmount
        slippage: number
      }
    | undefined
  balanceDiffs?: Readonly<Record<Address, readonly BalanceDiff[]>> | undefined
  fee: {
    amount: Hex
    decimals: number
    formatted: string
    symbol: string
  } | null
  sponsor?:
    | {
        address: Address
        name?: string | undefined
        url?: string | undefined
      }
    | undefined
  sponsored: boolean
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
