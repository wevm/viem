import type * as AbiItem from 'ox/AbiItem'
import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as TransactionRequest from 'ox/tempo/TransactionRequest'

import type { ExactPartial, OneOf } from '../core/internal/types.js'

/** Tempo capability schema, keyed by RPC method. */
export type Schema = {
  fillTransaction: {
    Request: FillTransactionRequestCapabilities
    ReturnType: FillTransactionCapabilities
  }
  sendCalls: {
    Request: ExactPartial<TransactionRequest.TransactionRequest>
  }
}

/** Capabilities accepted by `eth_fillTransaction`. */
export type FillTransactionRequestCapabilities = {
  /** Whether to include `balanceDiffs` in the response. */
  balanceDiffs?: boolean | undefined
}

/** Capabilities returned by `eth_fillTransaction`. */
export type FillTransactionCapabilities = {
  autoSwap?:
    | {
        calls: readonly {
          to: Address.Address
          data: Hex.Hex
          value: Hex.Hex
        }[]
        maxIn: SwapAmount
        minOut: SwapAmount
        slippage: number
      }
    | undefined
  balanceDiffs?:
    | Readonly<Record<Address.Address, readonly BalanceDiff[]>>
    | undefined
  error?:
    | OneOf<
        | {
            abiItem: AbiItem.AbiItem
            args: readonly unknown[] | undefined
            data: Hex.Hex
            errorName: string
            message: string
          }
        | { errorName: 'unknown'; message: string }
      >
    | undefined
  fee?:
    | {
        amount: Hex.Hex
        decimals: number
        formatted: string
        symbol: string
      }
    | undefined
  requireFunds?:
    | {
        amount: Hex.Hex
        decimals: number
        formatted: string
        token: Address.Address
        symbol: string
      }
    | undefined
  sponsor?:
    | {
        address: Address.Address
        name?: string | undefined
        url?: string | undefined
      }
    | undefined
  sponsored?: boolean | undefined
  /** Virtual-address resolutions keyed by lowercase literal virtual address. */
  virtualAddresses?:
    | Readonly<Record<Address.Address, Address.Address | null>>
    | undefined
}

/** A balance change reported by `eth_fillTransaction`. */
export type BalanceDiff = {
  address: Address.Address
  decimals: number
  direction: 'incoming' | 'outgoing'
  formatted: string
  name: string
  recipients: readonly Address.Address[]
  symbol: string
  value: Hex.Hex
}

/** A swap leg reported by `eth_fillTransaction`. */
export type SwapAmount = {
  decimals: number
  formatted: string
  name: string
  symbol: string
  token: Address.Address
  value: Hex.Hex
}
