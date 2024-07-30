import type { Address } from 'abitype'

import type { Block, BlockTag } from '../types/block.js'
import type { FeeValuesEIP1559 } from '../types/fee.js'
import type { Hex } from '../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  TransactionType,
  RpcTransaction as core_RpcTransaction,
  RpcTransactionRequest as core_RpcTransactionRequest,
} from '../types/rpc.js'
import type {
  AccessList,
  TransactionBase,
  TransactionRequestBase,
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerialized,
  Transaction as core_Transaction,
  TransactionRequest as core_TransactionRequest,
} from '../types/transaction.js'
import type { Assign, ExactPartial, OneOf } from '../types/utils.js'

import type {
  OpStackDepositTransaction,
  OpStackRpcTransaction,
  TransactionSerializableDeposit,
  TransactionSerializedDeposit,
} from '../op-stack/types/transaction.js'

export type CeloBlock<
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
> = Assign<
  Block<
    bigint,
    includeTransactions,
    blockTag,
    CeloTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    difficulty?: bigint | undefined
    gasLimit?: bigint | undefined
    mixHash?: undefined
    nonce?: bigint | null
    randomness?:
      | {
          committed: Hex
          revealed: Hex
        }
      | undefined
    uncles?: undefined
  }
>

export type CeloRpcBlock<
  blockTag extends BlockTag = BlockTag,
  includeTransactions extends boolean = boolean,
> = Assign<
  RpcBlock<
    blockTag,
    includeTransactions,
    RpcTransaction<blockTag extends 'pending' ? true : false>
  >,
  {
    difficulty?: Hex | undefined
    mixHash?: undefined
    nonce?: Hex | null
    gasLimit?: Hex | undefined
    randomness?:
      | {
          committed: Hex
          revealed: Hex
        }
      | undefined
    uncles?: undefined
  }
>

export type CeloRpcTransaction<isPending extends boolean = boolean> = OneOf<
  | RpcTransaction<isPending>
  | RpcTransactionCIP42<isPending>
  | RpcTransactionCIP64<isPending>
  | OpStackRpcTransaction<isPending>
>

export type CeloRpcTransactionRequest = OneOf<
  RpcTransactionRequest | RpcTransactionRequestCIP64
>

export type CeloTransaction<isPending extends boolean = boolean> = OneOf<
  | Transaction<isPending>
  | TransactionCIP42<isPending>
  | TransactionCIP64<isPending>
  | OpStackDepositTransaction<isPending>
>

export type CeloTransactionRequest = OneOf<
  TransactionRequest | TransactionRequestCIP64
>

export type CeloTransactionSerializable = OneOf<
  | TransactionSerializable
  | TransactionSerializableCIP64
  | TransactionSerializableDeposit
>

export type CeloTransactionSerialized<
  type extends CeloTransactionType = CeloTransactionType,
> =
  | TransactionSerialized<type>
  | TransactionSerializedCIP42
  | TransactionSerializedCIP64
  | TransactionSerializedDeposit

export type CeloTransactionType = TransactionType | 'cip42' | 'cip64'

type RpcTransaction<isPending extends boolean = boolean> =
  core_RpcTransaction<isPending> & {
    feeCurrency: Address | null
    gatewayFee: Hex | null
    gatewayFeeRecipient: Address | null
  }

type RpcTransactionRequest = core_RpcTransactionRequest & {
  feeCurrency?: Address | undefined
}

export type RpcTransactionCIP42<isPending extends boolean = boolean> = Omit<
  TransactionBase<Quantity, Index, isPending>,
  'typeHex'
> & {
  accessList: AccessList
  chainId: Index
  feeCurrency: Address | null
  gatewayFee: Hex | null
  gatewayFeeRecipient: Address | null
  type: '0x7c'
} & FeeValuesEIP1559<Quantity>

export type RpcTransactionCIP64<isPending extends boolean = boolean> = Omit<
  TransactionBase<Quantity, Index, isPending>,
  'typeHex'
> & {
  accessList: AccessList
  chainId: Index
  feeCurrency: Address | null
  type: '0x7b'
} & FeeValuesEIP1559<Quantity>

export type RpcTransactionRequestCIP64 = TransactionRequestBase<
  Quantity,
  Index
> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  type?: '0x7b' | undefined
} & ExactPartial<FeeValuesEIP1559<Quantity>>

type Transaction<isPending extends boolean = boolean> = core_Transaction<
  bigint,
  number,
  isPending
> & {
  feeCurrency: Address | null
}

export type TransactionCIP42<isPending extends boolean = boolean> =
  TransactionBase<bigint, number, isPending> &
    FeeValuesEIP1559 & {
      accessList: AccessList
      chainId: number
      feeCurrency: Address | null
      gatewayFee: bigint | null
      gatewayFeeRecipient: Address | null
      type: 'cip42'
    }

export type TransactionCIP64<isPending extends boolean = boolean> =
  TransactionBase<bigint, number, isPending> &
    FeeValuesEIP1559 & {
      accessList: AccessList
      chainId: number
      feeCurrency: Address | null
      type: 'cip64'
    }

type TransactionRequest = core_TransactionRequest & {
  feeCurrency?: Address | undefined
}

export type TransactionRequestCIP64 = TransactionRequestBase & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  type?: 'cip64' | undefined
} & ExactPartial<FeeValuesEIP1559>

export type TransactionSerializableCIP42<
  quantity = bigint,
  index = number,
> = TransactionSerializableBase<quantity, index> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  gatewayFeeRecipient?: Address | undefined
  gatewayFee?: quantity | undefined
  chainId: number
  type?: 'cip42' | undefined
} & ExactPartial<FeeValuesEIP1559<quantity>>

export type TransactionSerializableCIP64<
  quantity = bigint,
  index = number,
> = TransactionSerializableBase<quantity, index> & {
  accessList?: AccessList | undefined
  feeCurrency?: Address | undefined
  chainId: number
  type?: 'cip64' | undefined
} & ExactPartial<FeeValuesEIP1559<quantity>>

export type TransactionSerializedCIP42 = `0x7c${string}`
export type TransactionSerializedCIP64 = `0x7b${string}`
