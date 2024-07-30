import type { Block, BlockTag } from '../../types/block.js'
import type { Hash } from '../../types/misc.js'
import type { RpcBlock } from '../../types/rpc.js'
import type {
  OpStackRpcTransaction,
  OpStackTransaction,
} from './transaction.js'

export type OpStackBlockOverrides = {
  stateRoot: Hash
}
export type OpStackBlock<
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
> = Block<
  bigint,
  includeTransactions,
  blockTag,
  OpStackTransaction<blockTag extends 'pending' ? true : false>
> &
  OpStackBlockOverrides

export type OpStackRpcBlockOverrides = {
  stateRoot: Hash
}
export type OpStackRpcBlock<
  blockTag extends BlockTag = BlockTag,
  includeTransactions extends boolean = boolean,
> = RpcBlock<
  blockTag,
  includeTransactions,
  OpStackRpcTransaction<blockTag extends 'pending' ? true : false>
> &
  OpStackRpcBlockOverrides
