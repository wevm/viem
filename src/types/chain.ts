import type { Chain, ChainFormatter, ChainFormatters } from '../chains/types.js'
import type { IsUndefined } from './utils.js'

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
