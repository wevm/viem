import type * as ExecutionError from './ExecutionError.js'
import type { Address, Hex } from 'ox'
import type { TransactionRequest } from 'ox/tempo'

import type { ExactPartial } from '../core/internal/types.js'

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
  /** Whether execution reverts return error capabilities instead of throwing. */
  errors?: boolean | undefined
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
  error?: ExecutionError.Rpc | undefined
  fee?:
    | {
        amount: Hex.Hex
        decimals: number
        formatted: string
        symbol: string
      }
    | undefined
  insufficientFunds?:
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
