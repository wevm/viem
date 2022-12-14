import type { Chain, Formatter } from '../chains'
import type {
  MapReturnTypes,
  MergeIntersectionProperties,
  NonEmptyProperties,
} from '../types'

export type ExtractFormatter<
  TChain extends Chain,
  TKey extends keyof NonNullable<TChain['formatters']>,
> = NonNullable<TChain['formatters']>[TKey]

export type FormatOptions<TSource, TTarget> = {
  formatter?: Formatter<TSource, TTarget>
  replacer: Formatter<TSource, TTarget>
}

export type Formatted<TSource, TTarget, TFormatter> =
  TFormatter extends Formatter<TSource>
    ? // If the attribute exists on the Target type (e.g. Block) AND Formatter type, then use the Formatter attribute.
      MergeIntersectionProperties<TTarget, MapReturnTypes<TFormatter>> &
        // If Formatter attributes exist, attach them; otherwise attach the Target type (e.g. Block).
        (NonEmptyProperties<MapReturnTypes<TFormatter>> extends Record<
          string,
          never
        >
          ? TTarget
          : NonEmptyProperties<MapReturnTypes<TFormatter>>)
    : never

export function format<
  TSource extends Record<string, any>,
  TTarget,
  TFormatter = any,
>(data: TSource, { formatter, replacer }: FormatOptions<TSource, TTarget>) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const key_ = key as keyof TSource
    const formatter_ = formatter?.[key_] || replacer[key_]
    acc[key_] = formatter_ ? formatter_?.(data) : value
    if (typeof acc[key_] === 'undefined') delete acc[key_]
    return acc
  }, data) as unknown as Formatted<TSource, TTarget, TFormatter>
}
