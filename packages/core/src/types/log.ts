import type { Address, Hash, Hex } from './misc'

export type Log<TQuantity = bigint, TIndex = number> = {
  /** The address from which this log originated */
  address: Address
  /** Hash of block containing this log or `null` if pending */
  blockHash: Hash | null
  /** Number of block containing this log or `null` if pending */
  blockNumber: TQuantity | null
  /** Contains the non-indexed arguments of the log */
  data: Hex
  /** Index of this log within its block or `null` if pending */
  logIndex: TIndex | null
  /** Hash of the transaction that created this log or `null` if pending */
  transactionHash: Hash | null
  /** Index of the transaction that created this log or `null` if pending */
  transactionIndex: TIndex | null
  /** List of order-dependent topics */
  topics: Hex[]
  /** `true` if this filter has been destroyed and is invalid */
  removed: boolean
}
