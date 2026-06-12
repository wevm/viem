import type { Prettify } from '../../src/types/utils.js'

type NormalizeObject<T extends object> = Prettify<
  {
    [K in keyof T as [T[K]] extends [never]
      ? never
      : undefined extends T[K]
        ? K
        : never]?: NormalizeType<Exclude<T[K], undefined>>
  } & {
    [K in keyof T as [T[K]] extends [never]
      ? never
      : undefined extends T[K]
        ? never
        : K]: NormalizeType<T[K]>
  }
>

export type NormalizeType<T> = T extends (...args: any) => any
  ? T
  : T extends readonly unknown[]
    ? number extends T['length']
      ? readonly NormalizeType<T[number]>[]
      : { [K in keyof T]: NormalizeType<T[K]> }
    : T extends object
      ? NormalizeObject<T>
      : T
