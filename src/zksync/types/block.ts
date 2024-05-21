import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcBlock } from '../../types/rpc.js'
import type { ZkSyncRpcTransaction, ZkSyncTransaction } from './transaction.js'

export type ZkSyncBatchDetails = Omit<
  ZkSyncBlockDetails,
  'operatorAddress' | 'protocolVersion'
> & {
  l1GasPrice: number
  l2FairGasPrice: number
}

export type ZkSyncBlockOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTimestamp: bigint | null
}

export type ZkSyncBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
> = Block<
  bigint,
  TIncludeTransactions,
  TBlockTag,
  ZkSyncTransaction<TBlockTag extends 'pending' ? true : false>
> &
  ZkSyncBlockOverrides

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

export type ZkSyncRpcBlockOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTimestamp: Hex | null
}

export type ZkSyncRpcBlock<
  TBlockTag extends BlockTag = BlockTag,
  TIncludeTransactions extends boolean = boolean,
> = RpcBlock<
  TBlockTag,
  TIncludeTransactions,
  ZkSyncRpcTransaction<TBlockTag extends 'pending' ? true : false>
> &
  ZkSyncRpcBlockOverrides

export type ZkSyncNumberParameter = {
  number: number
}
