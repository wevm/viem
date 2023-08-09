import type { Address } from 'abitype'

import type { FormattedBlock } from '../utils/formatters/block.js'
import type { PrepareRequestParameters } from '../utils/transaction/prepareRequest.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from './transaction.js'
import type { IsUndefined } from './utils.js'

export type Chain<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
  serializers extends ChainSerializers<formatters> | undefined =
    | ChainSerializers<formatters>
    | undefined,
> = import('@wagmi/chains').Chain & {
  formatters?: formatters | undefined
  serializers?: serializers | undefined
  fees?: ChainFees<formatters> | undefined
}

export type ChainContract = {
  address: Address
  blockCreated?: number
}

export type ChainFees<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  getDefaultPriorityFee(args: {
    block: FormattedBlock<{ formatters: formatters }>
    request: PrepareRequestParameters<
      Omit<Chain, 'formatters'> & { formatters: formatters }
    >
  }): Promise<bigint> | bigint
}

export type ChainFormatters = {
  block?: ChainFormatter<'block'>
  transaction?: ChainFormatter<'transaction'>
  transactionReceipt?: ChainFormatter<'transactionReceipt'>
  transactionRequest?: ChainFormatter<'transactionRequest'>
}

export type ChainFormatter<TType extends string = string> = {
  format: (args: any) => any
  type: TType
}

export type ChainSerializers<
  TFormatters extends ChainFormatters | undefined = undefined,
> = {
  transaction?: SerializeTransactionFn<
    TFormatters extends ChainFormatters
      ? TFormatters['transactionRequest'] extends ChainFormatter
        ? TransactionSerializableGeneric &
            Parameters<TFormatters['transactionRequest']['format']>[0]
        : TransactionSerializable
      : TransactionSerializable
  >
}

/////////////////////////////////////////////////////////////////////
// Utils

export type ExtractChainFormatterExclude<
  TChain extends { formatters?: Chain['formatters'] } | undefined,
  TType extends keyof ChainFormatters,
> = TChain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[TType] extends { exclude: infer Exclude }
    ? Extract<Exclude, string[]>[number]
    : ''
  : ''

export type ExtractChainFormatterParameters<
  TChain extends { formatters?: Chain['formatters'] } | undefined,
  TType extends keyof ChainFormatters,
  TFallback,
> = TChain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[TType] extends ChainFormatter
    ? Parameters<_Formatters[TType]['format']>[0]
    : TFallback
  : TFallback

export type ExtractChainFormatterReturnType<
  TChain extends { formatters?: Chain['formatters'] } | undefined,
  TType extends keyof ChainFormatters,
  TFallback,
> = TChain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[TType] extends ChainFormatter
    ? ReturnType<_Formatters[TType]['format']>
    : TFallback
  : TFallback

export type GetChain<
  TChain extends Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = IsUndefined<TChain> extends true
  ? { chain: TChainOverride | null }
  : { chain?: TChainOverride | null }
