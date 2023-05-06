import type { Address } from 'abitype'

import type { Hash, Hex } from './misc.js'
import type { Transaction } from './transaction.js'

export type Block<TQuantity = bigint, TTransaction = Transaction> = {
  /** Base fee per gas */
  baseFeePerGas: TQuantity | null
  /** Difficulty for this block */
  difficulty: TQuantity
  /** "Extra data" field of this block */
  extraData: Hex
  /** Maximum gas allowed in this block */
  gasLimit: TQuantity
  /** Total used gas by all transactions in this block */
  gasUsed: TQuantity
  /** Block hash or `null` if pending */
  hash: Hash | null
  /** Logs bloom filter or `null` if pending */
  logsBloom: Hex | null
  /** Address that received this block’s mining rewards */
  miner: Address
  /** Unique identifier for the block. */
  mixHash: Hash
  /** Proof-of-work hash or `null` if pending */
  nonce: Hex | null
  /** Block number or `null` if pending */
  number: TQuantity | null
  /** Parent block hash */
  parentHash: Hash
  /** Root of the this block’s receipts trie */
  receiptsRoot: Hex
  sealFields: Hex[]
  /** SHA3 of the uncles data in this block */
  sha3Uncles: Hash
  /** Size of this block in bytes */
  size: TQuantity
  /** Root of this block’s final state trie */
  stateRoot: Hash
  /** Unix timestamp of when this block was collated */
  timestamp: TQuantity
  /** Total difficulty of the chain until this block */
  totalDifficulty: TQuantity | null
  /** List of transaction objects or hashes */
  transactions: Hash[] | TTransaction[]
  /** Root of this block’s transaction trie */
  transactionsRoot: Hash
  /** List of uncle hashes */
  uncles: Hash[]
}

export type BlockIdentifier<TQuantity = bigint> = {
  /** Whether or not to throw an error if the block is not in the canonical chain as described below. Only allowed in conjunction with the blockHash tag. Defaults to false. */
  requireCanonical?: boolean
} & (
  | {
      /** The block in the canonical chain with this number */
      blockNumber: BlockNumber<TQuantity>
    }
  | {
      /** The block uniquely identified by this hash. The `blockNumber` and `blockHash` properties are mutually exclusive; exactly one of them must be set. */
      blockHash: Hash
    }
)

export type BlockNumber<TQuantity = bigint> = TQuantity

export type BlockTag = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'

export type Uncle<TQuantity = bigint, TTransaction = Transaction> = Block<
  TQuantity,
  TTransaction
>
