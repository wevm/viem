import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcBlock } from '../../types/rpc.js'
import type { Assign } from '../../types/utils.js'
import type { ZkSyncRpcTransaction, ZkSyncTransaction } from './transaction.js'

export type ZkSyncBatchDetails = Omit<
  ZkSyncBlockDetails,
  'operatorAddress' | 'protocolVersion'
> & {
  l1GasPrice: number
  l2FairGasPrice: number
}

export type ZkSyncBlock<
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
> = Assign<
  Block<
    bigint,
    includeTransactions,
    blockTag,
    ZkSyncTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    l1BatchNumber: bigint | null
    l1BatchTimestamp: bigint | null
  }
>

export type ZkSyncBlockDetails = {
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

export type ZkSyncRpcBlock<
  blockTag extends BlockTag = BlockTag,
  includeTransactions extends boolean = boolean,
> = Assign<
  RpcBlock<
    blockTag,
    includeTransactions,
    ZkSyncRpcTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    l1BatchNumber: Hex | null
    l1BatchTimestamp: Hex | null
  }
>

export type ZkSyncNumberParameter = {
  number: number
}
