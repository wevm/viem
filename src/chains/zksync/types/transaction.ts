import type { Address } from 'abitype'
import type { FeeValuesEIP1559 } from '../../../types/fee.js'
import type { Hex } from '../../../types/misc.js'
import type {
  TransactionBase,
  TransactionRequestBase,
} from '../../../types/transaction.js'

export type TransactionEIP712<
  TQuantity = bigint,
  TIndex = number,
  TPending extends boolean = boolean,
  TType = 'eip712',
> = TransactionBase<TQuantity, TIndex, TPending> &
  FeeValuesEIP1559<TQuantity> & {
    customSignature?: Hex
    gasPerPubdata?: bigint
    factoryDeps?: Hex[]
    paymaster?: Address
    paymasterInput?: Hex
    type: TType
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
