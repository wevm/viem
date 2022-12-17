import type { Chain, Formatter } from '../../chains'
import type { OptionalNullable } from '../../types'

export type ExtractFormatter<
  TChain extends Chain,
  TKey extends keyof NonNullable<TChain['formatters']>,
  TFallbackFormatter extends Formatter = Formatter,
> = NonNullable<TChain['formatters']>[TKey] extends NonNullable<unknown>
  ? NonNullable<TChain['formatters']>[TKey]
  : TFallbackFormatter

export type FormatOptions<TSource, TTarget> = {
  formatter: Formatter<TSource, TTarget>
}

/**
 * Creates a type that is the result of applying `TFormatter` to `TSource`.
 *
 * @example
 * Formatted<() => { a: undefined, b: bigint }, { a: bigint }>
 * => { a: undefined, b: bigint }
 *
 * @example
 * Formatted<() => {}, { a: bigint }>
 * => { a: bigint }
 *
 * @example
 * Formatted<() => { a: bigint | undefined, b: bigint }, { a: bigint, b: bigint }, true>
 * => { a?: bigint | undefined, b: bigint }
 */
export type Formatted<
  TFormatter,
  TFallback,
  TAllowOptional = false,
> = TFormatter extends Formatter
  ? // If Formatter attributes exist, attach them; otherwise attach the Target type (e.g. Block).
    ReturnType<TFormatter> extends Record<string, never>
    ? TFallback
    : TAllowOptional extends true
    ? OptionalNullable<ReturnType<TFormatter>>
    : Required<ReturnType<TFormatter>>
  : never

/**
 * @description Formats a data object using the given replacer and an optional formatter.
 */
export function format<
  TFormatter,
  TSource extends Record<string, any>,
  TTarget,
>(data: TSource, { formatter }: FormatOptions<TSource, TTarget>) {
  return formatter(data) as Formatted<TFormatter, TTarget>
}
