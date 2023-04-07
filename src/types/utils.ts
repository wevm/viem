/**
 * Filters out all members of {@link T} that are not {@link P}
 *
 * @param T - Items to filter
 * @param P - Type to filter out
 * @returns Filtered items
 *
 * @example
 * type Result = Filter<['a', 'b', 'c'], 'b'>
 * //   ^? type Result = ['a', 'c']
 */
export type Filter<
  T extends readonly unknown[],
  P,
  Acc extends readonly unknown[] = [],
> = T extends readonly [infer F, ...infer Rest extends readonly unknown[]]
  ? [F] extends [P]
    ? Filter<Rest, P, [...Acc, F]>
    : Filter<Rest, P, Acc>
  : readonly [...Acc]

/**
 * @description Checks if {@link T} can be narrowed further than {@link U}
 * @param T - Type to check
 * @param U - Type to against
 * @example
 * type Result = IsNarrowable<'foo', string>
 * //   ^? true
 */
export type IsNarrowable<T, U> = IsNever<
  (T extends U ? true : false) & (U extends T ? false : true)
> extends true
  ? false
  : true

/**
 * @description Checks if {@link T} is `never`
 * @param T - Type to check
 * @example
 * type Result = IsNever<never>
 * //   ^? type Result = true
 */
export type IsNever<T> = [T] extends [never] ? true : false

/**
 * @description Evaluates boolean "or" condition for {@link T} properties.
 * @param T - Type to check
 *
 * * @example
 * type Result = Or<[false, true, false]>
 * //   ^? type Result = true
 *
 * @example
 * type Result = Or<[false, false, false]>
 * //   ^? type Result = false
 */
export type Or<T extends readonly unknown[],> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? Head extends true
    ? true
    : Or<Tail>
  : false

/**
 * @description Checks if {@link T} is `undefined`
 * @param T - Type to check
 * @example
 * type Result = IsUndefined<undefined>
 * //   ^? type Result = true
 */
export type IsUndefined<T> = [undefined] extends [T] ? true : false

/**
 * Excludes empty attributes from T if TMaybeExclude is true.
 *
 * @example
 * type Result = MaybeExcludeEmpty<{ a: string, b: number, c: [] }, true>
 * //   ^? type Result = { a: string, b: number }
 * @example
 * type Result = MaybeExcludeEmpty<{ a: string, b: number, c: [] }, false>
 * //   ^? type Result = { a: string, b: number, c: [] }
 * @example
 * type Result = MaybeExcludeEmpty<{ a: string, b: number, c: undefined }, true>
 * //   ^? type Result = { a: string, b: number }
 */
export type MaybeExcludeEmpty<
  T,
  TMaybeExclude extends boolean,
> = TMaybeExclude extends true ? Exclude<T, [] | null | undefined> : T

export type MaybePromise<T> = T | Promise<T>

/**
 * @description Makes attributes on the type T required if TRequired is true.
 *
 * @example
 * MaybeRequired<{ a: string, b?: number }, true>
 * => { a: string, b: number }
 *
 * MaybeRequired<{ a: string, b?: number }, false>
 * => { a: string, b?: number }
 */
export type MaybeRequired<T, TRequired extends boolean> = TRequired extends true
  ? Required<T>
  : T

/**
 * @description Merges the intersection properties of T and U.
 *
 * @example
 * MergeIntersectionProperties<{ a: string, b: number }, { a: number, c: boolean }>
 * => { a: number, b: number }
 */
export type MergeIntersectionProperties<T, U> = {
  [K in
    keyof T as K extends keyof U
      ? U[K] extends void
        ? never
        : K
      : K]: K extends keyof U ? U[K] : T[K]
}

/**
 * @description Makes nullable properties from T optional.
 *
 * @example
 * OptionalNullable<{ a: string | undefined, c: number }>
 * => { a?: string | undefined, c: number }
 */
export type OptionalNullable<T> = {
  [K in keyof T as T[K] extends NonNullable<unknown> ? K : never]: T[K]
} & {
  [K in keyof T as T[K] extends NonNullable<unknown> ? never : K]?: T[K]
}

/**
 * @description Constructs a type by excluding `undefined` from `T`.
 *
 * @example
 * NoUndefined<string | undefined>
 * => string
 */
export type NoUndefined<T> = T extends undefined ? never : T

/**
 * @description Creates a type that is a partial of T, but with the required keys K.
 *
 * @example
 * PartialBy<{ a: string, b: number }, 'a'>
 * => { a?: string, b: number }
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * @description Combines members of an intersection into a readable type.
 *
 * @link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg
 * @example
 * Prettify<{ a: string } | { b: string } | { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type TrimLeft<T, Chars extends string = ' '> = T extends `${Chars}${infer R}`
  ? TrimLeft<R>
  : T
type TrimRight<T, Chars extends string = ' '> = T extends `${infer R}${Chars}`
  ? TrimRight<R>
  : T

/**
 * @description Creates a type with required keys K from T.
 *
 * @example
 * type Result = RequiredBy<{ a?: string, b?: number, c: number }, 'a' | 'c'>
 * //   ^? { a: string, b?: number, c: number }
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * @description Trims empty space from type T.
 *
 * @example
 * Trim<'      lol  '>
 * => 'lol'
 */
export type Trim<T, Chars extends string = ' '> = TrimLeft<
  TrimRight<T, Chars>,
  Chars
>

/**
 * @description Creates a type that extracts the values of T.
 *
 * @example
 * ValueOf<{ a: string, b: number }>
 * => string | number
 */
export type ValueOf<T> = T[keyof T]
