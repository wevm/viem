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
  /** Base fee per gas. */
  gasPrice?: never
  /** Total fee per gas in wei (gasPrice/baseFeePerGas + maxPriorityFeePerGas). */
  maxFeePerGas: TQuantity
  /** Max priority fee per gas (in wei). */
  maxPriorityFeePerGas: TQuantity
}

export type FeeValues<TQuantity = bigint> =
  | FeeValuesLegacy<TQuantity>
  | FeeValuesEIP1559<TQuantity>

export type FeeValuesType = 'legacy' | 'eip1559'
