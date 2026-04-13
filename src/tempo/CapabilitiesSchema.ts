import type { Address } from 'abitype'
import type { Hex } from '../types/misc.js'

export type CapabilitiesSchema = {
  fillTransaction: {
    ReturnType: {
      autoSwap?:
        | {
            maxIn: SwapAmount
            minOut: SwapAmount
            slippage: number
          }
        | undefined
      balanceDiffs?:
        | Readonly<Record<Address, readonly BalanceDiff[]>>
        | undefined
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
  }
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
