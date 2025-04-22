import type { Address } from 'abitype'

import type { Hash, Hex } from './misc.js'
import type { Transaction } from './transaction.js'
import type { Withdrawal } from './withdrawal.js'

export type Block<
  quantity = bigint,
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
  transaction = Transaction<
    bigint,
    number,
    blockTag extends 'pending' ? true : false
  >,
> = {
  /** Base fee per gas */
  baseFeePerGas: quantity | null
  /** Total used blob gas by all transactions in this block */
  blobGasUsed: quantity
  /** Difficulty for this block */
  difficulty: quantity
  /** Excess blob gas */
  excessBlobGas: quantity
  /** "Extra data" field of this block */
  extraData: Hex
  /** Maximum gas allowed in this block */
  gasLimit: quantity
  /** Total used gas by all transactions in this block */
  gasUsed: quantity
  /** Block hash or `null` if pending */
  hash: blockTag extends 'pending' ? null : Hash
  /** Logs bloom filter or `null` if pending */
  logsBloom: blockTag extends 'pending' ? null : Hex
  /** Address that received this block’s mining rewards, COINBASE address */
  miner: Address
  /** Unique identifier for the block. */
  mixHash: Hash
  /** Proof-of-work hash or `null` if pending */
  nonce: blockTag extends 'pending' ? null : Hex
  /** Block number or `null` if pending */
  number: blockTag extends 'pending' ? null : quantity
  /** Root of the parent beacon chain block */
  parentBeaconBlockRoot?: Hex | undefined
  /** Parent block hash */
  parentHash: Hash
  /** Root of the this block’s receipts trie */
  receiptsRoot: Hex
  sealFields: Hex[]
  /** SHA3 of the uncles data in this block */
  sha3Uncles: Hash
  /** Size of this block in bytes */
  size: quantity
  /** Root of this block’s final state trie */
  stateRoot: Hash
  /** Unix timestamp of when this block was collated */
  timestamp: quantity
  /** Total difficulty of the chain until this block */
  totalDifficulty: quantity | null
  /** List of transaction objects or hashes */
  transactions: includeTransactions extends true ? transaction[] : Hash[]
  /** Root of this block’s transaction trie */
  transactionsRoot: Hash
  /** List of uncle hashes */
  uncles: Hash[]
  /** List of withdrawal objects */
  withdrawals?: Withdrawal[] | undefined
  /** Root of the this block’s withdrawals trie */
  withdrawalsRoot?: Hex | undefined
}

export type BlockIdentifier<quantity = bigint> = {
  /** Whether or not to throw an error if the block is not in the canonical chain as described below. Only allowed in conjunction with the blockHash tag. Defaults to false. */
  requireCanonical?: boolean | undefined
} & (
  | {
      /** The block in the canonical chain with this number */
      blockNumber: BlockNumber<quantity>
    }
  | {
      /** The block uniquely identified by this hash. The `blockNumber` and `blockHash` properties are mutually exclusive; exactly one of them must be set. */
      blockHash: Hash
    }
)

/** Represents a block number in the blockchain. */
export type BlockNumber<quantity = bigint> = quantity

/**
 * Specifies a particular block in the blockchain.
 *
 * - `"latest"`: the latest proposed block
 * - `"earliest"`: the earliest/genesis block – lowest numbered block the client has available
 * - `"pending"`: pending state/transactions – next block built by the client on top
 *   of unsafe and containing the set of transactions usually taken from local mempool
 * - `"safe"`: the latest safe head block – the most recent block that is safe from
 *   re-orgs under honest majority and certain synchronicity assumptions
 * - `"finalized"`: the latest finalized block – the most recent crypto-economically secure block;
 *   cannot be re-orged outside of manual intervention driven by community coordination
 *
 * Using `pending`, while allowed, is not advised, as it may lead
 * to internally inconsistent results. Use of `latest` is safe and will not
 * lead to inconsistent results. Depending on the backing RPC networks caching system,
 * the usage of `pending` may lead to inconsistencies as a result of an
 * overly aggressive cache system. This may cause downstream errors/invalid states.
 */
export type BlockTag = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'

export type Uncle<
  quantity = bigint,
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
  transaction = Transaction<
    bigint,
    number,
    blockTag extends 'pending' ? true : false
  >,
> = Block<quantity, includeTransactions, blockTag, transaction>
