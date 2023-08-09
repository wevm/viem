import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesEIP1559 } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
} from '../../types/transaction.js'

export type OptimismBlockOverrides = {
  stateRoot: Hash
}
export type OptimismBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
> = Block<
  bigint,
  TIncludeTransactions,
  TBlockTag,
  OptimismTransaction<TBlockTag extends 'pending' ? true : false>
> &
  OptimismBlockOverrides

export type OptimismRpcBlockOverrides = {
  stateRoot: Hash
}
export type OptimismRpcBlock<
  TBlockTag extends BlockTag = BlockTag,
  TIncludeTransactions extends boolean = boolean,
> = RpcBlock<
  TBlockTag,
  TIncludeTransactions,
  OptimismRpcTransaction<TBlockTag extends 'pending' ? true : false>
> &
  OptimismRpcBlockOverrides

type RpcTransaction<TPending extends boolean = boolean> =
  RpcTransaction_<TPending> & {
    isSystemTx?: undefined
    mint?: undefined
    sourceHash?: undefined
  }

export type OptimismRpcDepositTransaction<TPending extends boolean = boolean> =
  Omit<TransactionBase<Quantity, Index, TPending>, 'typeHex'> &
    FeeValuesEIP1559<Quantity> & {
      isSystemTx?: boolean
      mint?: Hex
      sourceHash: Hex
      type: '0x7e'
    }
export type OptimismRpcTransaction<TPending extends boolean = boolean> =
  | RpcTransaction<TPending>
  | OptimismRpcDepositTransaction<TPending>

export type OptimismRpcTransactionReceiptOverrides = {
  l1GasPrice: Hex | null
  l1GasUsed: Hex | null
  l1Fee: Hex | null
  l1FeeScalar: `${number}` | null
}
export type OptimismRpcTransactionReceipt = RpcTransactionReceipt &
  OptimismRpcTransactionReceiptOverrides

type Transaction<TPending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  TPending
> & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}

export type OptimismDepositTransaction<TPending extends boolean = boolean> =
  TransactionBase<bigint, number, TPending> &
    FeeValuesEIP1559 & {
      isSystemTx?: boolean
      mint?: bigint
      sourceHash: Hex
      type: 'deposit'
    }

export type OptimismTransaction<TPending extends boolean = boolean> =
  | Transaction<TPending>
  | OptimismDepositTransaction<TPending>

export type OptimismTransactionReceiptOverrides = {
  l1GasPrice: bigint | null
  l1GasUsed: bigint | null
  l1Fee: bigint | null
  l1FeeScalar: number | null
}
export type OptimismTransactionReceipt = TransactionReceipt &
  OptimismTransactionReceiptOverrides
