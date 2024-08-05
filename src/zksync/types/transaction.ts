import type { Address } from 'abitype'
import type { FeeValuesEIP1559 } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcTransactionReceipt,
  RpcTransactionRequest as RpcTransactionRequest_,
} from '../../types/rpc.js'
import type {
  TransactionBase,
  TransactionEIP1559 as TransactionEIP1559_,
  TransactionEIP2930 as TransactionEIP2930_,
  TransactionLegacy as TransactionLegacy_,
  TransactionReceipt,
  TransactionRequestBase,
  TransactionRequest as TransactionRequest_,
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerialized,
  TransactionType,
  Transaction as Transaction_,
} from '../../types/transaction.js'
import type { ExactPartial, OneOf, UnionOmit } from '../../types/utils.js'
import type { ZksyncEip712Meta } from './eip712.js'
import type { ZksyncFee, ZksyncFeeValues } from './fee.js'
import type {
  ZksyncL2ToL1Log,
  ZksyncLog,
  ZksyncRpcL2ToL1Log,
  ZksyncRpcLog,
} from './log.js'

type EIP712Type = '0x71'
type PriorityType = '0xff'

// Transaction
// https://era.zksync.io/docs/api/js/types#transactionresponse

type TransactionOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
}

type TransactionPriority<pending extends boolean = boolean> = TransactionBase<
  bigint,
  number,
  pending
> &
  TransactionOverrides &
  FeeValuesEIP1559 & {
    type: 'priority'
  }

export type ZksyncTransactionEIP712<pending extends boolean = boolean> =
  TransactionBase<bigint, number, pending> &
    TransactionOverrides &
    FeeValuesEIP1559 & {
      type: 'eip712' | 'priority'
    }
/** @deprecated Use `ZksyncTransactionEIP712` instead */
export type ZkSyncTransactionEIP712 = ZksyncTransactionEIP712;

type Transaction<pending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  pending
> &
  TransactionOverrides

export type ZksyncTransaction<pending extends boolean = boolean> =
  | Transaction<pending>
  | TransactionPriority<pending>
  | ZksyncTransactionEIP712<pending>
/** @deprecated Use `ZksyncTransaction` instead */
export type ZkSyncTransaction = ZksyncTransaction;

// Transaction (RPC)

type RpcTransactionOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
}

type RpcTransactionLegacy<pending extends boolean = boolean> =
  TransactionLegacy_<Hex, Hex, pending, '0x0'> & RpcTransactionOverrides

type RpcTransactionEIP2930<pending extends boolean = boolean> =
  TransactionEIP2930_<Hex, Hex, pending, '0x1'> & RpcTransactionOverrides

type RpcTransactionEIP1559<pending extends boolean = boolean> =
  TransactionEIP1559_<Hex, Hex, pending, '0x2'> & RpcTransactionOverrides

export type ZksyncRpcTransactionPriority<pending extends boolean = boolean> =
  TransactionBase<Quantity, Index, pending> &
    ZksyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: PriorityType
    }
/** @deprecated Use `ZksyncRpcTransactionPriority` instead */
export type ZkSyncRpcTransactionPriority = ZksyncRpcTransactionPriority;

export type ZksyncRpcTransactionEIP712<pending extends boolean = boolean> =
  TransactionBase<Quantity, Index, pending> &
    ZksyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: EIP712Type
    }
/** @deprecated Use `ZksyncRpcTransactionEIP712` instead */
export type ZkSyncRpcTransactionEIP712 = ZksyncRpcTransactionEIP712;

export type ZksyncRpcTransaction<pending extends boolean = boolean> = UnionOmit<
  | RpcTransactionLegacy<pending>
  | RpcTransactionEIP2930<pending>
  | RpcTransactionEIP1559<pending>
  | ZksyncRpcTransactionPriority<pending>
  | ZksyncRpcTransactionEIP712<pending>,
  'typeHex'
>
/** @deprecated Use `ZksyncRpcTransaction` instead */
export type ZkSyncRpcTransaction = ZksyncRpcTransaction;

// Transaction Request
// https://era.zksync.io/docs/reference/concepts/transactions

export type TransactionRequest<
  quantity = bigint,
  index = number,
> = TransactionRequest_<quantity, index> & {
  gasPerPubdata?: undefined
  customSignature?: undefined
  paymaster?: undefined
  paymasterInput?: undefined
  factoryDeps?: undefined
}

export type ZksyncTransactionRequestEIP712<
  quantity = bigint,
  index = number,
> = Omit<TransactionRequestBase<quantity, index>, 'type'> &
  ExactPartial<FeeValuesEIP1559> & {
    gasPerPubdata?: bigint | undefined
    customSignature?: Hex | undefined
    factoryDeps?: Hex[] | undefined
    type?: 'eip712' | 'priority' | undefined
  } & (
    | { paymaster: Address; paymasterInput: Hex }
    | { paymaster?: undefined; paymasterInput?: undefined }
  )
/** @deprecated Use `ZksyncTransactionRequestEIP712` instead */
export type ZkSyncTransactionRequestEIP712 = ZksyncTransactionRequestEIP712

export type ZksyncTransactionRequest<quantity = bigint, index = number> =
  | TransactionRequest<quantity, index>
  | ZksyncTransactionRequestEIP712<quantity, index>
/** @deprecated Use `ZksyncTransactionRequest` instead */
export type ZkSyncTransactionRequest = ZksyncTransactionRequest

type RpcTransactionRequest = RpcTransactionRequest_ & { eip712Meta?: undefined }

export type ZksyncRpcTransactionRequestEIP712 = TransactionRequestBase<
  Quantity,
  Index
> &
  ExactPartial<FeeValuesEIP1559<Quantity>> & {
    eip712Meta: ZksyncEip712Meta
    type: EIP712Type | PriorityType
  }
/** @deprecated Use `ZksyncRpcTransactionRequestEIP712` instead */
export type ZkSyncRpcTransactionRequestEIP712 = ZksyncRpcTransactionRequestEIP712;

export type ZksyncRpcTransactionRequest =
  | RpcTransactionRequest
  | ZksyncRpcTransactionRequestEIP712
/** @deprecated Use `ZksyncRpcTransactionRequest` instead */
export type ZkSyncRpcTransactionRequest = ZksyncRpcTransactionRequest

export type ZksyncTransactionType = TransactionType | 'eip712' | 'priority'
/** @deprecated Use `ZksyncTransactionType` instead */
export type ZkSyncTransactionType = ZksyncTransactionType

// Transaction Receipt
// https://era.zksync.io/docs/api/js/types#transactionreceipt

export type ZksyncRpcTransactionReceiptOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
  logs: ZksyncRpcLog[]
  l2ToL1Logs: ZksyncRpcL2ToL1Log[]
  root: Hex
}
/** @deprecated Use `ZksyncRpcTransactionReceiptOverrides` instead */
export type ZkSyncRpcTransactionReceiptOverrides = ZksyncRpcTransactionReceiptOverrides

export type ZksyncRpcTransactionReceipt = Omit<RpcTransactionReceipt, 'logs'> &
  ZksyncRpcTransactionReceiptOverrides
/** @deprecated Use `ZksyncRpcTransactionReceipt` instead */
export type ZkSyncRpcTransactionReceipt = ZksyncRpcTransactionReceipt

export type ZksyncTransactionReceiptOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
  logs: ZksyncLog[]
  l2ToL1Logs: ZksyncL2ToL1Log[]
}
/** @deprecated Use `ZksyncTransactionReceiptOverrides` instead */
export type ZkSyncTransactionReceiptOverrides = ZksyncTransactionReceiptOverrides

export type ZksyncTransactionReceipt<
  status = 'success' | 'reverted',
  type = ZksyncTransactionType,
> = Omit<TransactionReceipt<bigint, number, status, type>, 'logs'> &
  ZksyncTransactionReceiptOverrides
/** @deprecated Use `ZksyncTransactionReceipt` instead */
export type ZkSyncTransactionReceipt = ZksyncTransactionReceipt

// Serializers

export type ZksyncTransactionSerializable = OneOf<
  TransactionSerializable | ZksyncTransactionSerializableEIP712
>
/** @deprecated Use `ZksyncTransactionSerializable` instead */
export type ZkSyncTransactionSerializable = ZksyncTransactionSerializable

export type ZksyncTransactionSerialized<
  type extends TransactionType = 'eip712',
> = type extends 'eip712'
  ? ZksyncTransactionSerializedEIP712
  : TransactionSerialized<type>
/** @deprecated Use `ZksyncTransactionSerialized` instead */
export type ZkSyncTransactionSerialized = ZksyncTransactionSerialized

export type ZksyncTransactionSerializedEIP712 = `0x71${string}`
/** @deprecated Use `ZksyncTransactionSerializedEIP712` instead */
export type ZkSyncTransactionSerializedEIP712 = ZksyncTransactionSerializedEIP712

export type ZksyncTransactionSerializableEIP712<
  quantity = bigint,
  index = number,
> = Omit<TransactionSerializableEIP1559<quantity, index>, 'type'> & {
  from: Hex
  gasPerPubdata?: bigint | undefined
  paymaster?: Address | undefined
  factoryDeps?: Hex[] | undefined
  paymasterInput?: Hex | undefined
  customSignature?: Hex | undefined
  type?: 'eip712' | undefined
}
/** @deprecated Use `ZksyncTransactionSerializableEIP712` instead */
export type ZkSyncTransactionSerializableEIP712 = ZksyncTransactionSerializableEIP712

// EIP712 Signer

export type ZksyncEIP712TransactionSignable = {
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
/** @deprecated Use `ZksyncEIP712TransactionSignable` instead */
export type ZkSyncEIP712TransactionSignable = ZksyncEIP712TransactionSignable

export type TransactionRequestEIP712<
  quantity = bigint,
  index = number,
  transactionType = 'eip712',
> = TransactionRequestBase<quantity, index> &
  ExactPartial<FeeValuesEIP1559<quantity>> & {
    accessList?: undefined
    gasPerPubdata?: bigint | undefined
    factoryDeps?: Hex[] | undefined
    paymaster?: Address | undefined
    paymasterInput?: Hex | undefined
    customSignature?: Hex | undefined
    type?: transactionType | undefined
  }

type CommonDataRawBlockTransaction = {
  sender: Address
  maxFeePerGas: Hex
  gasLimit: Hex
  gasPerPubdataLimit: Hex
  ethHash: Hash
  ethBlock: number
  canonicalTxHash: Hash
  toMint: Hex
  refundRecipient: Address
}

export type ZksyncRawBlockTransactions = {
  commonData: {
    L1?:
      | ({
          serialId: number
          deadlineBlock: number
          layer2TipFee: Hex
          fullFee: Hex
          opProcessingType: string
          priorityQueueType: string
        } & CommonDataRawBlockTransaction)
      | undefined
    L2?:
      | {
          nonce: number
          fee: ZksyncFee<Hex>
          initiatorAddress: Address
          signature: Uint8Array
          transactionType: string
          input?:
            | {
                hash: Hash
                data: Uint8Array
              }
            | undefined
          paymasterParams: {
            paymaster: Address
            paymasterInput: Uint8Array
          }
        }
      | undefined
    ProtocolUpgrade?:
      | ({
          upgradeId: string
        } & CommonDataRawBlockTransaction)
      | undefined
  }
  execute: {
    calldata: Hash
    contractAddress: Address
    factoryDeps?: Hash
    value: bigint
  }
  receivedTimestampMs: number
  rawBytes?: string | undefined
}[]
/** @deprecated Use `ZksyncRawBlockTransactions` instead */
export type ZkSyncRawBlockTransactions = ZksyncRawBlockTransactions

export type ZksyncTransactionDetails = {
  isL1Originated: boolean
  status: string
  fee: bigint
  gasPerPubdata: bigint
  initiatorAddress: Address
  receivedAt: Date
  ethCommitTxHash?: Hash | undefined
  ethProveTxHash?: Hash | undefined
  ethExecuteTxHash?: Hash | undefined
}
/** @deprecated Use `ZksyncTransactionDetails` instead */
export type ZkSyncTransactionDetails = ZksyncTransactionDetails
