import {
  InvalidSerializableTransactionError,
  type InvalidSerializableTransactionErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  FeeValuesEIP1559,
  FeeValuesEIP4844,
  FeeValuesLegacy,
} from '../../index.js'
import type {
  TransactionRequestEIP1559,
  TransactionRequestEIP2930,
  TransactionRequestEIP4844,
  TransactionRequestGeneric,
  TransactionRequestLegacy,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableGeneric,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import type {
  Assign,
  ExactPartial,
  IsNever,
  OneOf,
  Opaque,
} from '../../types/utils.js'

type BaseProperties = {
  accessList?: undefined
  blobs?: undefined
  blobVersionedHashes?: undefined
  gasPrice?: undefined
  maxFeePerBlobGas?: undefined
  maxFeePerGas?: undefined
  maxPriorityFeePerGas?: undefined
  sidecars?: undefined
}

type LegacyProperties = Assign<BaseProperties, FeeValuesLegacy>
type EIP1559Properties = Assign<
  BaseProperties,
  OneOf<
    | {
        maxFeePerGas: FeeValuesEIP1559['maxFeePerGas']
      }
    | {
        maxPriorityFeePerGas: FeeValuesEIP1559['maxPriorityFeePerGas']
      },
    FeeValuesEIP1559
  > & {
    accessList?: TransactionSerializableEIP2930['accessList'] | undefined
  }
>
type EIP2930Properties = Assign<
  BaseProperties,
  ExactPartial<FeeValuesLegacy> & {
    accessList: TransactionSerializableEIP2930['accessList']
  }
>
type EIP4844Properties = Assign<
  BaseProperties,
  ExactPartial<FeeValuesEIP4844> &
    OneOf<
      | {
          blobs: TransactionSerializableEIP4844['blobs']
        }
      | {
          blobVersionedHashes: TransactionSerializableEIP4844['blobVersionedHashes']
        }
      | {
          sidecars: TransactionSerializableEIP4844['sidecars']
        },
      TransactionSerializableEIP4844
    >
>

export type GetTransactionType<
  transaction extends OneOf<
    TransactionSerializableGeneric | TransactionRequestGeneric
  > = TransactionSerializableGeneric,
  result =
    | (transaction extends
        | Opaque<TransactionSerializableLegacy, transaction>
        | Opaque<TransactionRequestLegacy, transaction>
        | LegacyProperties
        ? 'legacy'
        : never)
    | (transaction extends
        | Opaque<TransactionSerializableEIP1559, transaction>
        | Opaque<TransactionRequestEIP1559, transaction>
        | EIP1559Properties
        ? 'eip1559'
        : never)
    | (transaction extends
        | Opaque<TransactionSerializableEIP2930, transaction>
        | Opaque<TransactionRequestEIP2930, transaction>
        | EIP2930Properties
        ? 'eip2930'
        : never)
    | (transaction extends
        | Opaque<TransactionSerializableEIP4844, transaction>
        | Opaque<TransactionRequestEIP4844, transaction>
        | EIP4844Properties
        ? 'eip4844'
        : never)
    | (transaction['type'] extends string ? transaction['type'] : never),
> = IsNever<result> extends false ? result : string

export type GetTransationTypeErrorType =
  | InvalidSerializableTransactionErrorType
  | ErrorType

export function getTransactionType<
  const transaction extends OneOf<
    TransactionSerializableGeneric | TransactionRequestGeneric
  >,
>(transaction: transaction): GetTransactionType<transaction> {
  if (transaction.type)
    return transaction.type as GetTransactionType<transaction>

  if (
    typeof transaction.blobs !== 'undefined' ||
    typeof transaction.blobVersionedHashes !== 'undefined' ||
    typeof transaction.maxFeePerBlobGas !== 'undefined' ||
    typeof transaction.sidecars !== 'undefined'
  )
    return 'eip4844' as any

  if (
    typeof transaction.maxFeePerGas !== 'undefined' ||
    typeof transaction.maxPriorityFeePerGas !== 'undefined'
  ) {
    return 'eip1559' as any
  }

  if (typeof transaction.gasPrice !== 'undefined') {
    if (typeof transaction.accessList !== 'undefined') return 'eip2930' as any
    return 'legacy' as any
  }

  throw new InvalidSerializableTransactionError({ transaction })
}
