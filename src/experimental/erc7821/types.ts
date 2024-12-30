import type { AbiStateMutability, Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { GetMulticallContractParameters } from '../../types/multicall.js'
import type { OneOf } from '../../types/utils.js'
import type { Prettify } from '../../types/utils.js'

export type Call<call = unknown> = OneOf<
  | {
      data?: Hex | undefined
      to: Address
      value?: bigint | undefined
    }
  | (Omit<
      GetMulticallContractParameters<call, AbiStateMutability>,
      'address'
    > & {
      to: Address
      value?: bigint | undefined
    })
>

export type Calls<
  calls extends readonly unknown[],
  ///
  result extends readonly any[] = [],
> = calls extends readonly [] // no calls, return empty
  ? readonly []
  : calls extends readonly [infer call] // one call left before returning `result`
    ? readonly [...result, Prettify<Call<call>>]
    : calls extends readonly [infer call, ...infer rest] // grab first call and recurse through `rest`
      ? Calls<[...rest], [...result, Prettify<Call<call>>]>
      : readonly unknown[] extends calls
        ? calls
        : // If `calls` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
          // use this to infer the param types in the case of Array.map() argument
          calls extends readonly (infer call extends OneOf<Call>)[]
          ? readonly Prettify<call>[]
          : // Fallback
            readonly OneOf<Call>[]