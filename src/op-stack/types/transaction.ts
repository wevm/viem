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
import type { ExactPartial, OneOf } from '../../types/utils.js'

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
/**
 * A post-exec transaction (type `0x7d`), as returned over JSON-RPC.
 *
 * The sequencer appends at most one to a block, as its last transaction. It has
 * no signer, so `from` is the zero address and `gas` and `value` are zero. The
 * user transaction fields are left out, or reported as zero by some clients.
 */
export type OpStackRpcPostExecTransaction<pending extends boolean = boolean> =
  Omit<
    TransactionBase<Quantity, Index, pending>,
    'nonce' | 'r' | 's' | 'to' | 'typeHex' | 'v' | 'yParity'
  > &
    ExactPartial<
      Pick<TransactionBase<Quantity, Index, pending>, 'nonce' | 'r' | 's' | 'v'>
    > & {
      gasPrice?: Quantity | undefined
      to?: null | undefined
      type: '0x7d'
    }
export type OpStackRpcTransaction<pending extends boolean = boolean> = OneOf<
  | RpcTransaction<pending>
  | OpStackRpcDepositTransaction<pending>
  | OpStackRpcPostExecTransaction<pending>
>

export type OpStackRpcTransactionReceiptOverrides = {
  depositNonce?: Quantity | undefined
  depositReceiptVersion?: Quantity | undefined
  opGasRefund?: Quantity | null | undefined
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

/**
 * A post-exec transaction (type `0x7d`). Its `input` is the post-exec payload.
 */
export type OpStackPostExecTransaction<pending extends boolean = boolean> =
  Omit<
    TransactionBase<bigint, number, pending>,
    'nonce' | 'r' | 's' | 'to' | 'v' | 'yParity'
  > &
    ExactPartial<
      Pick<
        TransactionBase<bigint, number, pending>,
        'nonce' | 'r' | 's' | 'v' | 'yParity'
      >
    > & {
      gasPrice?: bigint | undefined
      isSystemTx?: undefined
      mint?: undefined
      sourceHash?: undefined
      to: null
      type: 'postExec'
    }

export type OpStackTransaction<pending extends boolean = boolean> =
  | Transaction<pending>
  | OpStackDepositTransaction<pending>
  | OpStackPostExecTransaction<pending>

export type OpStackTransactionReceiptOverrides = {
  depositNonce?: bigint | undefined
  depositReceiptVersion?: number | undefined
  opGasRefund?: bigint | null | undefined
  l1GasPrice: bigint | null
  l1GasUsed: bigint | null
  l1Fee: bigint | null
  l1FeeScalar: number | null
}
export type OpStackTransactionReceipt = TransactionReceipt &
  OpStackTransactionReceiptOverrides

export type OpStackTransactionSerializable = OneOf<
  | TransactionSerializableDeposit
  | TransactionSerializablePostExec
  | TransactionSerializable
>

export type OpStackTransactionSerialized<
  type extends OpStackTransactionType = OpStackTransactionType,
> = type extends 'deposit'
  ? TransactionSerializedDeposit
  : type extends 'postExec'
    ? TransactionSerializedPostExec
    : TransactionSerialized<type>

export type OpStackTransactionType = TransactionType | 'deposit' | 'postExec'

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

/** A post-exec transaction (type `0x7d`) to serialize. It has no signature. */
export type TransactionSerializablePostExec = {
  /** The post-exec payload: the RLP list that follows the `0x7d` type byte. */
  data: Hex
  /** The transaction type. */
  type: 'postExec'
}

/**
 * A serialized post-exec transaction: the `0x7d` type byte followed by the
 * payload.
 */
export type TransactionSerializedPostExec = `0x7d${string}`
