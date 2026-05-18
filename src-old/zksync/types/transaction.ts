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

export type ZksyncRpcTransactionEIP712<pending extends boolean = boolean> =
  TransactionBase<Quantity, Index, pending> &
    ZksyncFeeValues<Quantity> &
    RpcTransactionOverrides & {
      accessList?: undefined
      chainId: Hex
      type: EIP712Type
    }

export type ZksyncRpcTransaction<pending extends boolean = boolean> = UnionOmit<
  | RpcTransactionLegacy<pending>
  | RpcTransactionEIP2930<pending>
  | RpcTransactionEIP1559<pending>
  | ZksyncRpcTransactionPriority<pending>
  | ZksyncRpcTransactionEIP712<pending>,
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

export type ZksyncTransactionRequest<quantity = bigint, index = number> =
  | TransactionRequest<quantity, index>
  | ZksyncTransactionRequestEIP712<quantity, index>

type RpcTransactionRequest = RpcTransactionRequest_ & { eip712Meta?: undefined }

export type ZksyncRpcTransactionRequestEIP712 = TransactionRequestBase<
  Quantity,
  Index
> &
  ExactPartial<FeeValuesEIP1559<Quantity>> & {
    eip712Meta: ZksyncEip712Meta
    type: EIP712Type | PriorityType
  }

export type ZksyncRpcTransactionRequest =
  | RpcTransactionRequest
  | ZksyncRpcTransactionRequestEIP712

export type ZksyncTransactionType = TransactionType | 'eip712' | 'priority'

// Transaction Receipt
// https://era.zksync.io/docs/api/js/types#transactionreceipt

export type ZksyncRpcTransactionReceiptOverrides = {
  l1BatchNumber: Hex | null
  l1BatchTxIndex: Hex | null
  logs: ZksyncRpcLog[]
  l2ToL1Logs: ZksyncRpcL2ToL1Log[]
  root: Hex
}

export type ZksyncRpcTransactionReceipt = Omit<RpcTransactionReceipt, 'logs'> &
  ZksyncRpcTransactionReceiptOverrides

export type ZksyncTransactionReceiptOverrides = {
  l1BatchNumber: bigint | null
  l1BatchTxIndex: bigint | null
  logs: ZksyncLog[]
  l2ToL1Logs: ZksyncL2ToL1Log[]
}

export type ZksyncTransactionReceipt<
  status = 'success' | 'reverted',
  type = ZksyncTransactionType,
> = Omit<TransactionReceipt<bigint, number, status, type>, 'logs'> &
  ZksyncTransactionReceiptOverrides

// Serializers

export type ZksyncTransactionSerializable = OneOf<
  TransactionSerializable | ZksyncTransactionSerializableEIP712
>

export type ZksyncTransactionSerialized<
  type extends TransactionType = 'eip712',
> = type extends 'eip712'
  ? ZksyncTransactionSerializedEIP712
  : TransactionSerialized<type>

export type ZksyncTransactionSerializedEIP712 = `0x71${string}`

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
