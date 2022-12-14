import type { Chain, Formatter } from '../chains'
import type {
  MapReturnTypes,
  MergeIntersectionProperties,
  NonEmptyProperties,
  OptionalProperties,
} from '../types'

export type ExtractFormatter<
  TChain extends Chain,
  TKey extends keyof NonNullable<TChain['formatters']>,
> = NonNullable<TChain['formatters']>[TKey]

export type FormatOptions<TSource, TTarget> = {
  formatter?: Formatter<TSource, TTarget>
  replacer: Formatter<TSource, TTarget>
}

/**
 * The type of the object that results from applying `TFormatter` to
 * the `TSource` and merging it with the `TTarget`.
 *
 * If `TFormatter` has properties that exist on the `TTarget`, those properties
 * will be overwritten by the `TFormatter` properties.
 *
 * If `TFormatter` has no properties, then the result will be the same
 * as the `TTarget` object.
 *
 * @example
 * Formatted<{ a: `0x${string}`, b: number }, { a: bigint }, { a: () => undefined }>
 * => { a: undefined, b: number }
 *
 * @example
 * Formatted<{ a: `0x${string}`, b: number }, { a: bigint }, { c: () => boolean }>
 * => { a: bigint, b: number, c: boolean }
 *
 * @example
 * Formatted<{ a: `0x${string}`, b: number }, { a: bigint }, { a: () => number }>
 * => { a: number, b: number }
 */
export type Formatted<
  TSource,
  TTarget,
  TFormatter,
  TAllowOptional = false,
> = TFormatter extends Formatter<TSource>
  ? // If the attribute exists on the Target type (e.g. Block) AND Formatter type, then use the Formatter attribute.
    MergeIntersectionProperties<TTarget, MapReturnTypes<TFormatter>> &
      // If Formatter attributes exist, attach them; otherwise attach the Target type (e.g. Block).
      (NonEmptyProperties<MapReturnTypes<TFormatter>> extends Record<
        string,
        never
      >
        ? TTarget
        : TAllowOptional extends true
        ? OptionalProperties<NonEmptyProperties<MapReturnTypes<TFormatter>>>
        : NonEmptyProperties<MapReturnTypes<TFormatter>>)
  : never

/**
 * @description Formats a data object using the given replacer and an optional formatter.
 */
export function format<
  TSource extends Record<string, any>,
  TTarget,
  TFormatter = any,
>(data: TSource, { formatter, replacer }: FormatOptions<TSource, TTarget>) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const key_ = key as keyof TSource
    const formatter_ = formatter?.[key_] || replacer[key_]
    acc[key_] = formatter_ ? formatter_?.(data) : value
    return acc
  }, data) as unknown as Formatted<TSource, TTarget, TFormatter>
}
