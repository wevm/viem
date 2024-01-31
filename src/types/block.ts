import type { Address } from 'abitype'

import type { Hash, Hex } from './misc.js'
import type { Transaction } from './transaction.js'
import type { Withdrawal } from './withdrawal.js'

export type Block<
  TQuantity = bigint,
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
  TTransaction = Transaction<
    bigint,
    number,
    TBlockTag extends 'pending' ? true : false
  >,
> = {
  /** Base fee per gas */
  baseFeePerGas: TQuantity | null
  /** Total used blob gas by all transactions in this block */
  blobGasUsed: TQuantity
  /** Difficulty for this block */
  difficulty: TQuantity
  /** Excess blob gas */
  excessBlobGas: TQuantity
  /** "Extra data" field of this block */
  extraData: Hex
  /** Maximum gas allowed in this block */
  gasLimit: TQuantity
  /** Total used gas by all transactions in this block */
  gasUsed: TQuantity
  /** Block hash or `null` if pending */
  hash: TBlockTag extends 'pending' ? null : Hash
  /** Logs bloom filter or `null` if pending */
  logsBloom: TBlockTag extends 'pending' ? null : Hex
  /** Address that received this block’s mining rewards */
  miner: Address
  /** Unique identifier for the block. */
  mixHash: Hash
  /** Proof-of-work hash or `null` if pending */
  nonce: TBlockTag extends 'pending' ? null : Hex
  /** Block number or `null` if pending */
  number: TBlockTag extends 'pending' ? null : TQuantity
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
  transactions: TIncludeTransactions extends true ? TTransaction[] : Hash[]
  /** Root of this block’s transaction trie */
  transactionsRoot: Hash
  /** List of uncle hashes */
  uncles: Hash[]
  /** List of withdrawal objects */
  withdrawals?: Withdrawal[]
  /** Root of the this block’s withdrawals trie */
  withdrawalsRoot?: Hex
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

export type Uncle<
  TQuantity = bigint,
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
  TTransaction = Transaction<
    bigint,
    number,
    TBlockTag extends 'pending' ? true : false
  >,
> = Block<TQuantity, TIncludeTransactions, TBlockTag, TTransaction>
