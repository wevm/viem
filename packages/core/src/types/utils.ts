/**
 * @description Merges the intersection properties of T and U.
 *
 * @example
 * MergeIntersectionProperties<{ a: string, b: number }, { a: number, c: boolean }>
 * => { a: number, b: number }
 */
export type MergeIntersectionProperties<T, U> = {
  [K in keyof T as K extends keyof U
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
 * @description Creates a type that is a partial of T, but with the required keys K.
 *
 * @example
 * PartialBy<{ a: string, b: number }, 'a'>
 * => { a?: string, b: number }
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * @description Creates a type that extracts the values of T.
 *
 * @example
 * ValueOf<{ a: string, b: number }>
 * => string | number
 */
export type ValueOf<T> = T[keyof T]
