import type { FeeValuesEIP1559 } from '../../types/fee.js'
import type { Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerialized,
  TransactionType,
} from '../../types/transaction.js'
import type { OneOf } from '../../types/utils.js'

type RpcTransaction<pending extends boolean = boolean> =
  RpcTransaction_<pending> & {
    isSystemTx?: undefined
    mint?: undefined
    sourceHash?: undefined
  }

export type OpStackRpcDepositTransaction<pending extends boolean = boolean> =
  Omit<TransactionBase<Quantity, Index, pending>, 'typeHex'> &
    FeeValuesEIP1559<Quantity> & {
      isSystemTx?: boolean | undefined
      mint?: Hex | undefined
      sourceHash: Hex
      type: '0x7e'
    }
export type OpStackRpcTransaction<pending extends boolean = boolean> = OneOf<
  RpcTransaction<pending> | OpStackRpcDepositTransaction<pending>
>

export type OpStackRpcTransactionReceiptOverrides = {
  l1GasPrice: Hex | null
  l1GasUsed: Hex | null
  l1Fee: Hex | null
  l1FeeScalar: `${number}` | null
}
export type OpStackRpcTransactionReceipt = RpcTransactionReceipt &
  OpStackRpcTransactionReceiptOverrides

type Transaction<pending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  pending
> & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}

export type OpStackDepositTransaction<pending extends boolean = boolean> =
  TransactionBase<bigint, number, pending> &
    FeeValuesEIP1559 & {
      isSystemTx?: boolean
      mint?: bigint | undefined
      sourceHash: Hex
      type: 'deposit'
    }

export type OpStackTransaction<pending extends boolean = boolean> =
  | Transaction<pending>
  | OpStackDepositTransaction<pending>

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
  type extends OpStackTransactionType = OpStackTransactionType,
> = type extends 'deposit'
  ? TransactionSerializedDeposit
  : TransactionSerialized<type>

export type OpStackTransactionType = TransactionType | 'deposit'

export type TransactionSerializableDeposit<
  quantity = bigint,
  index = number,
> = Omit<
  TransactionSerializableBase<quantity, index>,
  'nonce' | 'r' | 's' | 'v'
> & {
  from: Hex
  isSystemTx?: boolean
  mint?: bigint | undefined
  sourceHash: Hex
  type: 'deposit'
}

export type TransactionSerializedDeposit = `0x7e${string}`
