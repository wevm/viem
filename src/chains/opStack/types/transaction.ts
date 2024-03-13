import type { FeeValuesEIP1559 } from '../../../types/fee.js'
import type { Hex } from '../../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
} from '../../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerialized,
  TransactionType,
} from '../../../types/transaction.js'
import type { OneOf } from '../../../types/utils.js'

type RpcTransaction<TPending extends boolean = boolean> =
  RpcTransaction_<TPending> & {
    isSystemTx?: undefined
    mint?: undefined
    sourceHash?: undefined
  }

export type OpStackRpcDepositTransaction<TPending extends boolean = boolean> =
  Omit<TransactionBase<Quantity, Index, TPending>, 'typeHex'> &
    FeeValuesEIP1559<Quantity> & {
      isSystemTx?: boolean
      mint?: Hex
      sourceHash: Hex
      type: '0x7e'
    }
export type OpStackRpcTransaction<TPending extends boolean = boolean> =
  | RpcTransaction<TPending>
  | OpStackRpcDepositTransaction<TPending>

export type OpStackRpcTransactionReceiptOverrides = {
  l1GasPrice: Hex | null
  l1GasUsed: Hex | null
  l1Fee: Hex | null
  l1FeeScalar: `${number}` | null
}
export type OpStackRpcTransactionReceipt = RpcTransactionReceipt &
  OpStackRpcTransactionReceiptOverrides

type Transaction<TPending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  TPending
> & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}

export type OpStackDepositTransaction<TPending extends boolean = boolean> =
  TransactionBase<bigint, number, TPending> &
    FeeValuesEIP1559 & {
      isSystemTx?: boolean
      mint?: bigint
      sourceHash: Hex
      type: 'deposit'
    }

export type OpStackTransaction<TPending extends boolean = boolean> =
  | Transaction<TPending>
  | OpStackDepositTransaction<TPending>

export type OpStackTransactionReceiptOverrides = {
  l1GasPrice: bigint | null
  l1GasUsed: bigint | null
  l1Fee: bigint | null
  l1FeeScalar: number | null
}
export type OpStackTransactionReceipt = TransactionReceipt &
  OpStackTransactionReceiptOverrides

export type OpStackTransactionSerializable = OneOf<
  TransactionSerializableDeposit | TransactionSerializable
>

export type OpStackTransactionSerialized<
  TType extends OpStackTransactionType = OpStackTransactionType,
> = TType extends 'deposit'
  ? TransactionSerializedDeposit
  : TransactionSerialized<TType>

export type OpStackTransactionType = TransactionType | 'deposit'

export type TransactionSerializableDeposit<
  TQuantity = bigint,
  TIndex = number,
> = Omit<
  TransactionSerializableBase<TQuantity, TIndex>,
  'nonce' | 'r' | 's' | 'v'
> & {
  from: Hex
  isSystemTx?: boolean
  mint?: bigint
  sourceHash: Hex
  type: 'deposit'
}

export type TransactionSerializedDeposit = `0x7e${string}`
