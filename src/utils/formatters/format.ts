import type { Chain } from '../../types/chain.js'
import type { Formatter } from '../../types/formatter.js'
import type { OptionalNullable } from '../../types/utils.js'

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
  TUseParameters = false,
> = TFormatter extends Formatter
  ? // If Formatter attributes exist, attach them; otherwise attach the Target type (e.g. Block).
    ReturnType<TFormatter> extends Record<string, never>
    ? TFallback
    : TAllowOptional extends true
    ? OptionalNullable<
        TUseParameters extends true
          ? Parameters<TFormatter>[0]
          : ReturnType<TFormatter>
      >
    : TUseParameters extends true
    ? Parameters<TFormatter>[0]
    : ReturnType<TFormatter>
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

export function defineFormatter<
  TSource extends Record<string, unknown>,
  TFormatted,
>({
  format,
}: {
  format: (data: TSource) => TFormatted
}) {
  return <
      TFormat extends Formatter<
        TSource,
        Partial<TFormatted> & { [key: string]: unknown }
      >,
      TExclude extends (keyof TSource)[] = [],
    >({
      exclude,
      format: formatOverride,
    }: {
      exclude?: TExclude
      format?: TFormat
    }) =>
    (data: TSource & { [key: string]: unknown }) => {
      const formatted = format(data)
      if (exclude) {
        for (const key of exclude) {
          delete (formatted as any)[key]
        }
      }
      return {
        ...formatted,
        ...formatOverride?.(data),
      } as TFormatted &
        ReturnType<TFormat> & {
          [K in TExclude[number]]: never
        }
    }
}
