import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesEIP1559 } from '../../types/fee.js'
import type { Log as Log_ } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  RpcLog as RpcLog_,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
  TransactionType,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
  TransactionRequest,
  TransactionRequestBase,
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerialized,
} from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'

import type { Abi, AbiEvent } from 'abitype'

// Types
// https://era.zksync.io/docs/api/js/types.html

export type Log<
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
  l1BatchNumber: TQuantity
  transactionLogIndex: TIndex
  logType: Hex | null
}

export type RpcLog = RpcLog_ & {
  l1BatchNumber: Hex
  // These are returned but doesn't apear in Log structure neither is mentioned in https://era.zksync.io/docs/api/js/types.html
  transactionLogIndex: Hex
  logType: Hex | null
}

// User to get gas estimate
type PaymasterParams = {
  paymaster: Address
  paymasterInput: number[]
}

export type Eip712Meta = {
  gasPerPubdata?: Hex
  factoryDeps?: Hex[]
  customSignature?: Hex
  paymasterParams?: PaymasterParams
}

export type L2ToL1Log = {
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

export type RpcL2ToL1Log = {
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

// Transaction

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

export type TransactionEIP712<TPending extends boolean = boolean> =
  TransactionBase<bigint, number, TPending> &
    TransactionOverrides &
    FeeValuesEIP1559 & {
      type: 'eip712'
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
  | TransactionEIP712<TPending>

// RPC

type RpcTransactionOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
}

export type RpcTransaction<TPending extends boolean = boolean> =
  RpcTransaction_<TPending> &
    Partial<ZkSyncFeeValues<Quantity>> &
    RpcTransactionOverrides

export type RpcTransactionLegacy<TPending extends boolean = boolean> =
  TransactionBase<Quantity, Index, TPending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      type: '0x0'
    }

export type RpcTransactionEIP1559<TPending extends boolean = boolean> =
  TransactionBase<Quantity, Index, TPending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      type: '0x2'
    }

export type RpcTransactionPriority<TPending extends boolean = boolean> =
  TransactionBase<Quantity, Index, TPending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      type: '0xff'
    }

export type RpcTransactionEIP712<TPending extends boolean = boolean> =
  TransactionBase<Quantity, Index, TPending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      type: '0x71'
    }

export type ZkSyncRpcTransaction<TPending extends boolean = boolean> =
  UnionOmit<
    | RpcTransaction<TPending>
    | RpcTransactionLegacy<TPending>
    | RpcTransactionEIP1559<TPending>
    | RpcTransactionPriority<TPending>
    | RpcTransactionEIP712<TPending>,
    'typeHex'
  > & { chainId: Hex }

// Transaction Request
// https://era.zksync.io/docs/reference/concepts/transactions.html

export type ZkSyncTransactionRequest = TransactionRequest &
  Partial<FeeValuesEIP1559> & {
    gasPerPubdata: bigint
    customSignature?: Hex
    paymaster?: Address
    paymasterInput?: Hex
    factoryDeps?: Hex[]
    type?: 'eip712'
  }

type RpcTransactionRequestEIP712 = TransactionRequestBase<Quantity, Index> &
  Partial<FeeValuesEIP1559<Quantity>> & {
    eip712Meta: Eip712Meta
    type?: '0x71'
  }

export type ZkSyncRpcTransactionRequest = RpcTransactionRequestEIP712

export type ZkSyncTransactionType = TransactionType | 'eip712' | 'priority'

// Transaction Receipt
// https://era.zksync.io/docs/api/js/types.html#transactionreceipt

export type ZkSyncRpcTransactionReceiptOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
  logs: RpcLog[]
  l2ToL1Logs: RpcL2ToL1Log[]
  // Why root isn't added into RpcTransactionReceipt?
  root: Hex
}

export type ZkSyncRpcTransactionReceipt = Omit<RpcTransactionReceipt, 'logs'> &
  ZkSyncRpcTransactionReceiptOverrides

export type ZkSyncTransactionReceiptOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
  logs: Log[]
  l2ToL1Logs: L2ToL1Log[]
}
export type ZkSyncTransactionReceipt = Omit<TransactionReceipt, 'logs'> &
  ZkSyncTransactionReceiptOverrides

//
// Serializers
//

export type ZkSyncTransactionSerializable =
  | TransactionSerializable
  | TransactionSerializableEIP712

export type ZkSyncTransactionSerialized<
  TType extends ZkSyncTransactionType = 'eip1559',
> = TransactionSerialized<TType> | TransactionSerializedEIP712

export type TransactionSerializableEIP712<
  TQuantity = bigint,
  TIndex = number,
> = TransactionSerializableBase<TQuantity, TIndex> &
  FeeValuesEIP1559<TQuantity> & {
    from: Hex
    maxFeePerGas?: TQuantity
    maxPriorityFeePerGas?: TQuantity
    gasPerPubdata?: bigint
    paymaster?: Address
    factoryDeps?: Hex[]
    paymasterInput?: Hex
    customSignature: Hex
    chainId: number
    type?: 'eip712'
  }

export type TransactionSerializedEIP712 = `0x71${string}`
