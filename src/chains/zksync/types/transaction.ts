import type { Address } from 'abitype'
import type { FeeValuesEIP1559 } from '../../../types/fee.js'
import type { Hex } from '../../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcTransactionRequest as RpcTransactionRequest_,
} from '../../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionEIP1559 as TransactionEIP1559_,
  TransactionEIP2930 as TransactionEIP2930_,
  TransactionLegacy as TransactionLegacy_,
  TransactionReceipt,
  TransactionRequest as TransactionRequest_,
  TransactionRequestBase,
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerialized,
  TransactionType,
} from '../../../types/transaction.js'
import type { OneOf, UnionOmit } from '../../../types/utils.js'
import type { ZkSyncEip712Meta } from './eip712.js'
import type { ZkSyncFeeValues } from './fee.js'
import type {
  ZkSyncL2ToL1Log,
  ZkSyncLog,
  ZkSyncRpcL2ToL1Log,
  ZkSyncRpcLog,
} from './log.js'

type EIP712Type = '0x71'
type PriorityType = '0xff'

// Transaction
// https://era.zksync.io/docs/api/js/types#transactionresponse

type TransactionOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
}

type TransactionPriority<TPending extends boolean = boolean> = TransactionBase<
  bigint,
  number,
  TPending
> &
  TransactionOverrides &
  FeeValuesEIP1559 & {
    type: 'priority'
  }

export type ZkSyncTransactionEIP712<TPending extends boolean = boolean> =
  TransactionBase<bigint, number, TPending> &
    TransactionOverrides &
    FeeValuesEIP1559 & {
      type: 'eip712' | 'priority'
    }

type Transaction<TPending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  TPending
> &
  TransactionOverrides

export type ZkSyncTransaction<TPending extends boolean = boolean> =
  | Transaction<TPending>
  | TransactionPriority<TPending>
  | ZkSyncTransactionEIP712<TPending>

// Transaction (RPC)

type RpcTransactionOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
}

type RpcTransactionLegacy<TPending extends boolean = boolean> =
  TransactionLegacy_<Hex, Hex, TPending, '0x0'> & RpcTransactionOverrides

type RpcTransactionEIP2930<TPending extends boolean = boolean> =
  TransactionEIP2930_<Hex, Hex, TPending, '0x1'> & RpcTransactionOverrides

type RpcTransactionEIP1559<TPending extends boolean = boolean> =
  TransactionEIP1559_<Hex, Hex, TPending, '0x2'> & RpcTransactionOverrides

export type ZkSyncRpcTransactionPriority<TPending extends boolean = boolean> =
  TransactionBase<Quantity, Index, TPending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: PriorityType
    }

export type ZkSyncRpcTransactionEIP712<TPending extends boolean = boolean> =
  TransactionBase<Quantity, Index, TPending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: EIP712Type
    }

export type ZkSyncRpcTransaction<TPending extends boolean = boolean> =
  UnionOmit<
    | RpcTransactionLegacy<TPending>
    | RpcTransactionEIP2930<TPending>
    | RpcTransactionEIP1559<TPending>
    | ZkSyncRpcTransactionPriority<TPending>
    | ZkSyncRpcTransactionEIP712<TPending>,
    'typeHex'
  >

// Transaction Request
// https://era.zksync.io/docs/reference/concepts/transactions

type TransactionRequest = TransactionRequest_ & {
  gasPerPubdata?: undefined
  customSignature?: undefined
  paymaster?: undefined
  paymasterInput?: undefined
  factoryDeps?: undefined
}

export type ZkSyncTransactionRequestEIP712 = Omit<
  TransactionRequestBase,
  'type'
> &
  Partial<FeeValuesEIP1559> & {
    gasPerPubdata?: bigint
    customSignature?: Hex
    factoryDeps?: Hex[]
    type?: 'eip712' | 'priority'
  } & (
    | { paymaster: Address; paymasterInput: Hex }
    | { paymaster?: undefined; paymasterInput?: undefined }
  )

export type ZkSyncTransactionRequest =
  | TransactionRequest
  | ZkSyncTransactionRequestEIP712

type RpcTransactionRequest = RpcTransactionRequest_ & { eip712Meta?: undefined }

export type ZkSyncRpcTransactionRequestEIP712 = TransactionRequestBase<
  Quantity,
  Index
> &
  Partial<FeeValuesEIP1559<Quantity>> & {
    eip712Meta: ZkSyncEip712Meta
    type: EIP712Type | PriorityType
  }

export type ZkSyncRpcTransactionRequest =
  | RpcTransactionRequest
  | ZkSyncRpcTransactionRequestEIP712

export type ZkSyncTransactionType = TransactionType | 'eip712' | 'priority'

// Transaction Receipt
// https://era.zksync.io/docs/api/js/types#transactionreceipt

export type ZkSyncRpcTransactionReceiptOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
  logs: ZkSyncRpcLog[]
  l2ToL1Logs: ZkSyncRpcL2ToL1Log[]
  root: Hex
}

export type ZkSyncTransactionReceiptOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
  logs: ZkSyncLog[]
  l2ToL1Logs: ZkSyncL2ToL1Log[]
}

export type ZkSyncTransactionReceipt<
  TStatus = 'success' | 'reverted',
  TType = ZkSyncTransactionType,
> = Omit<TransactionReceipt<bigint, number, TStatus, TType>, 'logs'> &
  ZkSyncTransactionReceiptOverrides

// Serializers

export type ZkSyncTransactionSerializable = OneOf<
  TransactionSerializable | ZkSyncTransactionSerializableEIP712
>

export type ZkSyncTransactionSerialized<
  TType extends TransactionType = 'eip712',
> = TType extends 'eip712'
  ? ZkSyncTransactionSerializedEIP712
  : TransactionSerialized<TType>

export type ZkSyncTransactionSerializedEIP712 = `0x71${string}`

export type ZkSyncTransactionSerializableEIP712<
  TQuantity = bigint,
  TIndex = number,
> = Omit<TransactionSerializableEIP1559<TQuantity, TIndex>, 'type'> & {
  from: Hex
  gasPerPubdata?: bigint
  paymaster?: Address
  factoryDeps?: Hex[]
  paymasterInput?: Hex
  customSignature?: Hex
  type?: 'eip712'
}

// EIP712 Signer

export type ZkSyncEIP712TransactionSignable = {
  txType: bigint
  from: bigint
  to: bigint
  gasLimit: bigint
  gasPerPubdataByteLimit: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymaster: bigint
  nonce: bigint
  value: bigint
  data: Hex
  factoryDeps: Hex[]
  paymasterInput: Hex
}

export type TransactionRequestEIP712<
  TQuantity = bigint,
  TIndex = number,
  TTransactionType = 'eip712',
> = TransactionRequestBase<TQuantity, TIndex> &
  Partial<FeeValuesEIP1559<TQuantity>> & {
    accessList?: never
    gasPerPubdata?: bigint
    factoryDeps?: Hex[]
    paymaster?: Address
    paymasterInput?: Hex
    customSignature?: Hex
    type?: TTransactionType
  }
