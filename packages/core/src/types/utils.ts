/**
 * @description Returns the return type of the functions in T.
 *
 * @example
 * MapReturnTypes<{ a: () => string, b: () => number }>
 * => { a: string, b: number }
 */
export type MapReturnTypes<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? ReturnType<T[K]>
    : never
}

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
 * @description Removes void properties from T.
 *
 * @example
 * NonEmptyProperties<{ a: string, b: void, c: number }>
 * => { a: string, c: number }
 */
export type NonEmptyProperties<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K]
}

/**
 * @description Makes nullable properties from T optional.
 *
 * @example
 * OptionalProperties<{ a: string | undefined, c: number }>
 * => { a?: string | undefined, c: number }
 */
export type OptionalProperties<T> = {
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
