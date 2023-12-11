import type { Address } from 'abitype'
import type { FeeValuesEIP1559 } from '../../../types/fee.js'
import type { Hex } from '../../../types/misc.js'
import type { TransactionRequestBase } from '../../../types/transaction.js'

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
