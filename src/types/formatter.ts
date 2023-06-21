import type { Chain } from './chain.js'

export type Formatter<TType extends string = string> = {
  format: (args: any) => any
  type: TType
}

export type Formatters = {
  block?: Formatter<'block'>
  transaction?: Formatter<'transaction'>
  transactionReceipt?: Formatter<'transactionReceipt'>
  transactionRequest?: Formatter<'transactionRequest'>
}

export type ExtractFormatterParameters<
  TChain extends Chain | undefined,
  TType extends keyof Formatters,
  TFallback,
> = TChain extends Chain<infer _Formatters extends Formatters>
  ? _Formatters[TType] extends Formatter
    ? Parameters<_Formatters[TType]['format']>[0]
    : TFallback
  : TFallback

export type ExtractFormatterReturnType<
  TChain extends Chain | undefined,
  TType extends keyof Formatters,
  TFallback,
> = TChain extends Chain<infer _Formatters extends Formatters>
  ? _Formatters[TType] extends Formatter
    ? ReturnType<_Formatters[TType]['format']>
    : TFallback
  : TFallback
