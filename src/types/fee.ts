import type { Address, Hex } from './misc'

export type EstimateGasParameters<TQuantity = bigint> = {
  /** Contract code or a hashed method call with encoded args */
  data?: Hex
  /** Gas provided for transaction execution */
  gas?: TQuantity
  /** Transaction sender */
  from?: Address
  /** Transaction recipient */
  to?: Address
  /** Value in wei sent with this transaction */
  value?: TQuantity
} & Partial<FeeValues<TQuantity>>

export type FeeHistory<TQuantity = bigint> = {
  /**
   * An array of block base fees per gas (in wei). This includes the next block after
   * the newest of the returned range, because this value can be derived from the newest block.
   * Zeroes are returned for pre-EIP-1559 blocks. */
  baseFeePerGas: TQuantity[]
  /** An array of block gas used ratios. These are calculated as the ratio of gasUsed and gasLimit. */
  gasUsedRatio: number[]
  /** Lowest number block of the returned range. */
  oldestBlock: TQuantity
  /** An array of effective priority fees (in wei) per gas data points from a single block. All zeroes are returned if the block is empty. */
  reward?: TQuantity[][]
}

export type FeeValuesLegacy<TQuantity = bigint> = {
  /** Base fee per gas. */
  gasPrice: TQuantity
  maxFeePerGas?: never
  maxPriorityFeePerGas?: never
}

export type FeeValuesEIP1559<TQuantity = bigint> = {
  gasPrice?: never
  /** Total fee per gas in wei (gasPrice/baseFeePerGas + maxPriorityFeePerGas). */
  maxFeePerGas: TQuantity
  /** Max priority fee per gas (in wei). */
  maxPriorityFeePerGas: TQuantity
}

export type FeeValues<TQuantity = bigint> =
  | FeeValuesLegacy<TQuantity>
  | FeeValuesEIP1559<TQuantity>
