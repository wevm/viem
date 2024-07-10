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
import type { ZkSyncEip712Meta } from './eip712.js'
import type { ZkSyncFee, ZkSyncFeeValues } from './fee.js'
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

type TransactionPriority<pending extends boolean = boolean> = TransactionBase<
  bigint,
  number,
  pending
> &
  TransactionOverrides &
  FeeValuesEIP1559 & {
    type: 'priority'
  }

export type ZkSyncTransactionEIP712<pending extends boolean = boolean> =
  TransactionBase<bigint, number, pending> &
    TransactionOverrides &
    FeeValuesEIP1559 & {
      type: 'eip712' | 'priority'
    }

type Transaction<pending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  pending
> &
  TransactionOverrides

export type ZkSyncTransaction<pending extends boolean = boolean> =
  | Transaction<pending>
  | TransactionPriority<pending>
  | ZkSyncTransactionEIP712<pending>

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

export type ZkSyncRpcTransactionPriority<pending extends boolean = boolean> =
  TransactionBase<Quantity, Index, pending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: PriorityType
    }

export type ZkSyncRpcTransactionEIP712<pending extends boolean = boolean> =
  TransactionBase<Quantity, Index, pending> &
    ZkSyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: EIP712Type
    }

export type ZkSyncRpcTransaction<pending extends boolean = boolean> = UnionOmit<
  | RpcTransactionLegacy<pending>
  | RpcTransactionEIP2930<pending>
  | RpcTransactionEIP1559<pending>
  | ZkSyncRpcTransactionPriority<pending>
  | ZkSyncRpcTransactionEIP712<pending>,
  'typeHex'
>

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

export type ZkSyncTransactionRequestEIP712<
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

export type ZkSyncTransactionRequest<quantity = bigint, index = number> =
  | TransactionRequest<quantity, index>
  | ZkSyncTransactionRequestEIP712<quantity, index>

type RpcTransactionRequest = RpcTransactionRequest_ & { eip712Meta?: undefined }

export type ZkSyncRpcTransactionRequestEIP712 = TransactionRequestBase<
  Quantity,
  Index
> &
  ExactPartial<FeeValuesEIP1559<Quantity>> & {
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

export type ZkSyncRpcTransactionReceipt = Omit<RpcTransactionReceipt, 'logs'> &
  ZkSyncRpcTransactionReceiptOverrides

export type ZkSyncTransactionReceiptOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
  logs: ZkSyncLog[]
  l2ToL1Logs: ZkSyncL2ToL1Log[]
}

export type ZkSyncTransactionReceipt<
  status = 'success' | 'reverted',
  type = ZkSyncTransactionType,
> = Omit<TransactionReceipt<bigint, number, status, type>, 'logs'> &
  ZkSyncTransactionReceiptOverrides

// Serializers

export type ZkSyncTransactionSerializable = OneOf<
  TransactionSerializable | ZkSyncTransactionSerializableEIP712
>

export type ZkSyncTransactionSerialized<
  type extends TransactionType = 'eip712',
> = type extends 'eip712'
  ? ZkSyncTransactionSerializedEIP712
  : TransactionSerialized<type>

export type ZkSyncTransactionSerializedEIP712 = `0x71${string}`

export type ZkSyncTransactionSerializableEIP712<
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

export type ZkSyncRawBlockTransactions = {
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
          fee: ZkSyncFee<Hex>
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

export type ZkSyncTransactionDetails = {
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
