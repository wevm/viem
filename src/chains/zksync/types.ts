import type { Abi, AbiEvent, Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesEIP1559 } from '../../types/fee.js'
import type { Log as Log_ } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  RpcLog as RpcLog_,
  RpcTransactionRequest as RpcTransactionRequest_,
} from '../../types/rpc.js'
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
} from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'

type EIP712Type = '0x71'
type PriorityType = '0xff'

// Types
// https://era.zksync.io/docs/api/js/types.html

export type ZkSyncLog<
  TQuantity = bigint,
  TIndex = number,
  TPending extends boolean = boolean,
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  TAbi extends Abi | readonly unknown[] | undefined = TAbiEvent extends AbiEvent
    ? [TAbiEvent]
    : undefined,
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
> = Log_<TQuantity, TIndex, TPending, TAbiEvent, TStrict, TAbi, TEventName> & {
  l1BatchNumber: TQuantity | null
  transactionLogIndex: TIndex
  logType: Hex | null
}

export type ZkSyncRpcLog = RpcLog_ & {
  l1BatchNumber: Hex | null
  // These are returned but doesn't apear in Log structure neither is mentioned in https://era.zksync.io/docs/api/js/types.html
  transactionLogIndex: Hex
  logType: Hex | null
}

type PaymasterParams = {
  paymaster: Address
  paymasterInput: number[]
}

export type ZkSyncEip712Meta = {
  gasPerPubdata?: Hex
  factoryDeps?: Hex[]
  customSignature?: Hex
  paymasterParams?: PaymasterParams
}

export type ZkSyncL2ToL1Log = {
  blockNumber: bigint
  blockHash: string
  l1BatchNumber: bigint
  transactionIndex: bigint
  shardId: bigint
  isService: boolean
  sender: string
  key: string
  value: string
  transactionHash: string
  logIndex: bigint
}

export type ZkSyncRpcL2ToL1Log = {
  blockNumber: Hex
  blockHash: Hex
  l1BatchNumber: Hex
  transactionIndex: Hex
  shardId: Hex
  isService: boolean
  sender: Hex
  key: Hex
  value: Hex
  transactionHash: Hex
  logIndex: Hex
}

export type ZkSyncFeeValues<TQuantity = bigint> = {
  gasPrice: TQuantity
  maxFeePerGas: TQuantity
  maxPriorityFeePerGas: TQuantity
}

// Block
// https://era.zksync.io/docs/api/js/types.html#block

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

// Block (RPC)

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

// Transaction
// https://era.zksync.io/docs/api/js/types.html#transactionresponse

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
// https://era.zksync.io/docs/reference/concepts/transactions.html

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
// https://era.zksync.io/docs/api/js/types.html#transactionreceipt

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

export type ZkSyncTransactionSerializable =
  | TransactionSerializable
  | ZkSyncTransactionSerializableEIP712

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
