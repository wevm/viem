import type { Block, BlockTag } from '../../../types/block.js'
import type { Hex } from '../../../types/misc.js'
import type { RpcBlock } from '../../../types/rpc.js'
import type { ZkSyncRpcTransaction, ZkSyncTransaction } from './transaction.js'

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
