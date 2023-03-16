/**
 * @description Checks if {@link T} is `never`
 * @param T - Type to check
 * @example
 * type Result = IsNever<never>
 * //   ^? true
 */
export type IsNever<T> = [T] extends [never] ? true : false

/**
 * @description Excludes empty attributes from T if TMaybeExclude is true.
 *
 * @example
 * MaybeExcludeEmpty<{ a: string, b: number, c: [] }, true>
 * => { a: string, b: number }
 *
 * MaybeExcludeEmpty<{ a: string, b: number, c: [] }, false>
 * => { a: string, b: number, c: [] }
 *
 * MaybeExcludeEmpty<{ a: string, b: number, c: undefined }, true>
 * => { a: string, b: number }
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
