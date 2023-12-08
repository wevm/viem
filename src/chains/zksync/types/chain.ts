import type {
  ChainConfig,
  ChainConstants,
  ChainFormatter,
  ChainFormatters,
} from '../../../types/chain.js'
import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from '../../../types/transaction.js'
import type { EIP712DomainFn } from './eip712signer.js'

export type ChainEIP712<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = ChainConstants & ChainConfigEIP712<formatters>

export type ChainConfigEIP712<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = ChainConfig & {
  /** Return EIP712 Domain for EIP712 transaction */
  eip712domain?: ChainEIP712Domain<formatters> | undefined
}

export type ChainEIP712Domain<
  formatters extends ChainFormatters | undefined = undefined,
  TransactionToSign = {},
> = {
  /** Retrieve EIP712 Domain to generate custom signature. */
  eip712domain?: EIP712DomainFn<
    formatters extends ChainFormatters
      ? formatters['transactionRequest'] extends ChainFormatter
        ? TransactionSerializableGeneric &
            Parameters<formatters['transactionRequest']['format']>[0]
        : TransactionSerializable
      : TransactionSerializable,
    TransactionToSign
  >
  /** Check if it is a EIP712 transaction */
  isEip712Domain?: (
    transaction: formatters extends ChainFormatters
      ? formatters['transactionRequest'] extends ChainFormatter
        ? TransactionSerializableGeneric &
            Parameters<formatters['transactionRequest']['format']>[0]
        : TransactionSerializable
      : TransactionSerializable,
  ) => boolean
}
