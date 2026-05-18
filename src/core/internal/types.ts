declare const symbol: unique symbol

export type Assign<target, source> = Assign_<target, source> & source

type Assign_<target, source> = {
  [key in keyof target as key extends keyof source
    ? source[key] extends void
      ? never
      : key
    : key]: key extends keyof source ? source[key] : target[key]
}

export type Branded<type, brand> = type & { [symbol]: brand }

export type Compute<type> = Prettify<type>

export type Evaluate<type> = {
  [key in keyof type]: type[key]
} & {}

export type ExactPartial<type> = {
  [key in keyof type]?: type[key] | undefined
}

export type ExactRequired<type> = {
  [key in keyof type]-?: Exclude<type[key], undefined>
}

export type Filter<
  values extends readonly unknown[],
  value,
  accumulator extends readonly unknown[] = [],
> = values extends readonly [
  infer head,
  ...infer tail extends readonly unknown[],
]
  ? [head] extends [value]
    ? Filter<tail, value, [...accumulator, head]>
    : Filter<tail, value, accumulator>
  : readonly [...accumulator]

export type IsNarrowable<type, base> =
  IsNever<
    (type extends base ? true : false) & (base extends type ? false : true)
  > extends true
    ? false
    : true

export type IsNever<type> = [type] extends [never] ? true : false

export type IsUndefined<type> = [undefined] extends [type] ? true : false

export type IsUnion<union, union2 = union> = union extends union2
  ? [union2] extends [union]
    ? false
    : true
  : never

export type LooseOmit<type, keys extends string> = Pick<
  type,
  Exclude<keyof type, keys>
>

export type MaybePartial<
  type,
  enabled extends boolean | undefined,
> = enabled extends true ? Prettify<ExactPartial<type>> : type

export type MaybePromise<type> = type | Promise<type>

export type MaybeRequired<
  type,
  required extends boolean,
> = required extends true ? ExactRequired<type> : type

export type Mutable<type extends object> = {
  -readonly [key in keyof type]: type[key]
}

export type NoUndefined<type> = type extends undefined ? never : type

export type Omit<type, keys extends keyof type> = Pick<
  type,
  Exclude<keyof type, keys>
>

export type OneOf<
  union extends object,
  fallback extends object | undefined = undefined,
  keys extends KeyofUnion<union> = KeyofUnion<union>,
> = union extends infer item
  ? Prettify<
      item & {
        [key in Exclude<keys, keyof item>]?: fallback extends object
          ? key extends keyof fallback
            ? fallback[key]
            : undefined
          : undefined
      }
    >
  : never

type KeyofUnion<type> = type extends type ? keyof type : never

export type Or<values extends readonly unknown[]> = values extends readonly [
  infer head,
  ...infer tail,
]
  ? head extends true
    ? true
    : Or<tail>
  : false

export type PartialBy<type, keys extends keyof type> = Omit<type, keys> &
  ExactPartial<Pick<type, keys>>

export type Prettify<type> = {
  [key in keyof type]: type[key]
} & {}

export type RequiredBy<type, keys extends keyof type> = Omit<type, keys> &
  ExactRequired<Pick<type, keys>>

export type Some<
  values extends readonly unknown[],
  value,
> = values extends readonly [value, ...unknown[]]
  ? true
  : values extends readonly [unknown, ...infer rest]
    ? Some<rest, value>
    : false

export type UnionEvaluate<type> = type extends object ? Prettify<type> : type

export type UnionLooseOmit<type, keys extends string> = type extends unknown
  ? LooseOmit<type, keys>
  : never

export type UnionOmit<type, keys extends keyof type> = type extends unknown
  ? Omit<type, keys>
  : never

export type UnionPartialBy<type, keys extends keyof type> = type extends unknown
  ? PartialBy<type, keys>
  : never

export type UnionPick<type, keys extends keyof type> = type extends unknown
  ? Pick<type, keys>
  : never

export type UnionRequiredBy<
  type,
  keys extends keyof type,
> = type extends unknown ? RequiredBy<type, keys> : never

export type UnionToTuple<union, last = LastInUnion<union>> = [union] extends [
  never,
]
  ? []
  : [...UnionToTuple<Exclude<union, last>>, last]

type LastInUnion<union> =
  UnionToIntersection<
    union extends unknown ? (value: union) => 0 : never
  > extends (value: infer last) => 0
    ? last
    : never

type UnionToIntersection<union> = (
  union extends unknown ? (value: union) => 0 : never
) extends (value: infer intersection) => 0
  ? intersection
  : never

export type ValueOf<type> = type[keyof type]
