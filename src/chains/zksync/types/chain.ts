import type { ChainFormatters } from '../../../types/chain.js'
import type { Chain, ChainFormatter } from '../../../types/chain.js'
import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from '../../../types/transaction.js'
import type { EIP712DomainFn } from './eip712.js'

export type ChainEIP712<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
  TransactionSignable = {},
> = Chain<
  formatters,
  {
    /** Return EIP712 Domain for EIP712 transaction */
    getEip712Domain?:
      | EIP712DomainFn<
          formatters extends ChainFormatters
            ? formatters['transactionRequest'] extends ChainFormatter
              ? TransactionSerializableGeneric &
                  Parameters<formatters['transactionRequest']['format']>[0]
              : TransactionSerializable
            : TransactionSerializable,
          TransactionSignable
        >
      | undefined
  }
>
