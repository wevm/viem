import type {
  Chain,
  ChainFormatter,
  ChainFormatters,
} from '../../types/chain.js'
import type { EIP712DomainFn } from './eip712.js'
import type { ZksyncTransactionSerializable } from './transaction.js'

export type ChainEIP712<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
  TransactionSignable = {},
  ///
  transactionSerializable extends
    ZksyncTransactionSerializable = formatters extends ChainFormatters
    ? formatters['transactionRequest'] extends ChainFormatter
      ? ZksyncTransactionSerializable &
          Parameters<formatters['transactionRequest']['format']>[0]
      : ZksyncTransactionSerializable
    : ZksyncTransactionSerializable,
> = Chain<
  formatters,
  {
    /** Return EIP712 Domain for EIP712 transaction */
    getEip712Domain?:
      | EIP712DomainFn<transactionSerializable, TransactionSignable>
      | undefined
  }
>
