import type { Chain } from './chain.js'

export type Formatter<TSource = any, TTarget = any> = (
  value: TSource,
) => TTarget

export type Formatters = {
  block?: Formatter
  transaction?: Formatter
  transactionReceipt?: Formatter
  transactionRequest?: Formatter
}

export type ExtractFormatterParameters<
  TChain extends Chain | undefined,
  TType extends keyof Formatters,
  TFallback,
> = TChain extends Chain<infer _Formatters extends Formatters>
  ? _Formatters[TType] extends Formatter
    ? Parameters<_Formatters[TType]>[0]
    : TFallback
  : TFallback

export type ExtractFormatterReturnType<
  TChain extends Chain | undefined,
  TType extends keyof Formatters,
  TFallback,
> = TChain extends Chain<infer _Formatters extends Formatters>
  ? _Formatters[TType] extends Formatter
    ? ReturnType<_Formatters[TType]>
    : TFallback
  : TFallback
