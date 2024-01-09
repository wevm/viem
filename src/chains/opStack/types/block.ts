import type { Block, BlockTag } from '../../../types/block.js'
import type { Hash } from '../../../types/misc.js'
import type { RpcBlock } from '../../../types/rpc.js'
import type {
  OpStackRpcTransaction,
  OpStackTransaction,
} from './transaction.js'

export type OpStackBlockOverrides = {
  stateRoot: Hash
}
export type OpStackBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
> = Block<
  bigint,
  TIncludeTransactions,
  TBlockTag,
  OpStackTransaction<TBlockTag extends 'pending' ? true : false>
> &
  OpStackBlockOverrides

export type OpStackRpcBlockOverrides = {
  stateRoot: Hash
}
export type OpStackRpcBlock<
  TBlockTag extends BlockTag = BlockTag,
  TIncludeTransactions extends boolean = boolean,
> = RpcBlock<
  TBlockTag,
  TIncludeTransactions,
  OpStackRpcTransaction<TBlockTag extends 'pending' ? true : false>
> &
  OpStackRpcBlockOverrides
