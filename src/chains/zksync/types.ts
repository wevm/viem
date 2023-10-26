import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { TransactionType } from '../../types/rpc.js'
import type {
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerialized,
} from '../../types/transaction.js'

export type ZkSyncTransactionType = TransactionType | '0x71' | '0x77'

//
// Serializers
//

export type ZkSyncTransactionSerializable =
  | TransactionSerializable
  | ZkSyncTransactionSerializableEIP712

export type ZkSyncTransactionSerialized<
  TType extends TransactionType = 'eip712',
> = TType extends 'eip712'
  ? TransactionSerializedEIP712
  : TransactionSerialized<TType>

export type TransactionSerializedEIP712 = `0x71${string}`

export type ZkSyncTransactionSerializableEIP712<
  TQuantity = bigint,
  TIndex = number,
> = Omit<TransactionSerializableEIP1559<TQuantity, TIndex>, 'type'> & {
  // I know this property is omited in the other types, but we need
  // this for the serializer.
  from: Hex
  gasPerPubdata?: bigint
  paymaster?: Address
  factoryDeps?: Hex[]
  paymasterInput?: Hex
  customSignature?: Hex
  type?: 'eip712'
}
