import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcBlock } from '../../types/rpc.js'
import type { Assign } from '../../types/utils.js'
import type { ZksyncRpcTransaction, ZksyncTransaction } from './transaction.js'

export type ZksyncBatchDetails = Omit<
  ZksyncBlockDetails,
  'operatorAddress' | 'protocolVersion'
> & {
  l1GasPrice: number
  l2FairGasPrice: number
}

export type ZksyncBlock<
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
> = Assign<
  Block<
    bigint,
    includeTransactions,
    blockTag,
    ZksyncTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    l1BatchNumber: bigint | null
    l1BatchTimestamp: bigint | null
  }
>

export type ZksyncBlockDetails = {
  number: number
  timestamp: number
  l1BatchNumber: number
  l1TxCount: number
  l2TxCount: number
  rootHash?: Hash
  status: string
  commitTxHash?: Hash
  committedAt?: Date
  proveTxHash?: Hash
  provenAt?: Date
  executeTxHash?: Hash
  executedAt?: Date
  baseSystemContractsHashes: {
    bootloader: Hash
    default_aa: Hash
  }
  operatorAddress: Address
  protocolVersion?: string
}

export type ZksyncRpcBlock<
  blockTag extends BlockTag = BlockTag,
  includeTransactions extends boolean = boolean,
> = Assign<
  RpcBlock<
    blockTag,
    includeTransactions,
    ZksyncRpcTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    l1BatchNumber: Hex | null
    l1BatchTimestamp: Hex | null
  }
>

export type ZksyncNumberParameter = {
  number: number
}
