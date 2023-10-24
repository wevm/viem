import type { Address } from 'abitype'
import type { FeeValuesEIP1559 } from '../../types/fee.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionType } from '../../types/rpc.js'
import type {
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerialized,
} from '../../types/transaction.js'
export type ZkSyncTransactionType = TransactionType | 'eip712' | 'priority'

//
// Serializers
//

export type ZkSyncTransactionSerializable =
  | TransactionSerializable
  | ZkSyncTransactionSerializableEIP712

export type ZkSyncTransactionSerialized<
  TType extends ZkSyncTransactionType = 'eip1559',
> = TransactionSerialized<TType> | ZkSyncTransactionSerializableEIP712

export type ZkSyncTransactionSerializableEIP712<
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
