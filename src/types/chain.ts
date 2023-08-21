import type { Address } from 'abitype'

import type { EstimateFeesPerGasReturnType } from '../actions/public/estimateFeesPerGas.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { FormattedBlock } from '../utils/formatters/block.js'
import type { PrepareRequestParameters } from '../utils/transaction/prepareRequest.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { FeeValuesType } from './fee.js'
import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from './transaction.js'
import type { IsUndefined, Prettify } from './utils.js'

export type Chain<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = import('@wagmi/chains').Chain & ChainConfig<formatters>

export type ChainConfig<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  formatters?: formatters | undefined
  serializers?: ChainSerializers<formatters> | undefined
  fees?: ChainFees<formatters> | undefined
}

export type ChainContract = {
  address: Address
  blockCreated?: number
}

type FeesFnParameters<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  /** The latest block. */
  block: Prettify<FormattedBlock<{ formatters: formatters }>>
  client: Client<Transport, Chain>
  /**
   * A transaction request. This value will be undefined if the caller
   * is outside of a transaction request context (e.g. a direct call to
   * the `estimateFeesPerGas` Action).
   */
  request?: PrepareRequestParameters<
    Omit<Chain, 'formatters'> & { formatters: formatters }
  >
}

export type ChainFees<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  /**
   * The fee multiplier to use to account for fee fluctuations.
   * Used in the [`estimateFeesPerGas` Action](/docs/actions/public/estimateFeesPerGas).
   *
   * @default 1.2
   */
  baseFeeMultiplier?: number
  /**
   * The default `maxPriorityFeePerGas` to use when a priority
   * fee is not defined upon sending a transaction.
   *
   * Overrides the return value in the [`estimateMaxPriorityFeePerGas` Action](TODO).
   */
  defaultPriorityFee?:
    | bigint
    | ((args: FeesFnParameters<formatters>) => Promise<bigint> | bigint)
  /**
   * Allows customization of fee per gas values (e.g. `maxFeePerGas`/`maxPriorityFeePerGas`).
   *
   * Overrides the return value in the [`estimateFeesPerGas` Action](TODO).
   */
  estimateFeesPerGas?: (
    args: {
      /**
       * A function to multiply the base fee based on the `baseFeeMultiplier`.
       */
      multiply(x: bigint): bigint
      /**
       * The type of fees to return.
       */
      type: FeeValuesType
    } & FeesFnParameters<formatters>,
  ) => Promise<EstimateFeesPerGasReturnType> | bigint
}

export type ChainFormatters = {
  block?: ChainFormatter<'block'>
  transaction?: ChainFormatter<'transaction'>
  transactionReceipt?: ChainFormatter<'transactionReceipt'>
  transactionRequest?: ChainFormatter<'transactionRequest'>
}

export type ChainFormatter<type extends string = string> = {
  format: (args: any) => any
  type: type
}

export type ChainSerializers<
  formatters extends ChainFormatters | undefined = undefined,
> = {
  transaction?: SerializeTransactionFn<
    formatters extends ChainFormatters
      ? formatters['transactionRequest'] extends ChainFormatter
        ? TransactionSerializableGeneric &
            Parameters<formatters['transactionRequest']['format']>[0]
        : TransactionSerializable
      : TransactionSerializable
  >
}

/////////////////////////////////////////////////////////////////////
// Utils

export type ExtractChainFormatterExclude<
  chain extends { formatters?: Chain['formatters'] } | undefined,
  type extends keyof ChainFormatters,
> = chain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[type] extends { exclude: infer Exclude }
    ? Extract<Exclude, string[]>[number]
    : ''
  : ''

export type ExtractChainFormatterParameters<
  chain extends { formatters?: Chain['formatters'] } | undefined,
  type extends keyof ChainFormatters,
  fallback,
> = chain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[type] extends ChainFormatter
    ? Parameters<_Formatters[type]['format']>[0]
    : fallback
  : fallback

export type ExtractChainFormatterReturnType<
  chain extends { formatters?: Chain['formatters'] } | undefined,
  type extends keyof ChainFormatters,
  fallback,
> = chain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[type] extends ChainFormatter
    ? ReturnType<_Formatters[type]['format']>
    : fallback
  : fallback

export type GetChain<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined = undefined,
> = IsUndefined<chain> extends true
  ? { chain: chainOverride | null }
  : { chain?: chainOverride | null }
