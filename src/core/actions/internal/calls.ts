import type { Abi, AbiStateMutability } from 'abitype'
import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'

import type { Assign, OneOf, Prettify } from '../../internal/types.js'
import type { ContractFunctionParameters } from './contract.js'

/** A single call in a batch (raw call data or contract function parameters). */
export type Call<
  call = unknown,
  extraProperties extends Record<string, unknown> = {},
> = OneOf<
  | Assign<
      {
        data?: Hex.Hex | undefined
        dataSuffix?: Hex.Hex | undefined
        to: Address.Address
        value?: bigint | undefined
      },
      extraProperties
    >
  | Assign<
      Omit<
        ContractFunctionParameters<
          call extends { abi: infer abi extends Abi } ? abi : Abi,
          AbiStateMutability
        >,
        'address'
      > & {
        data?: Hex.Hex | undefined
        dataSuffix?: Hex.Hex | undefined
        to: Address.Address
        value?: bigint | undefined
      },
      extraProperties
    >
>

/** A batch of {@link Call}s, preserving per-call inference. */
export type Calls<
  calls extends readonly unknown[],
  extraProperties extends Record<string, unknown> = {},
  ///
  result extends readonly any[] = [],
> = calls extends readonly [] // no calls, return empty
  ? readonly []
  : calls extends readonly [infer call] // one call left before returning `result`
    ? readonly [...result, Prettify<Call<call, extraProperties>>]
    : calls extends readonly [infer call, ...infer rest] // grab first call and recurse through `rest`
      ? Calls<
          [...rest],
          extraProperties,
          [...result, Prettify<Call<call, extraProperties>>]
        >
      : readonly unknown[] extends calls
        ? calls
        : // If `calls` is *some* array but we couldn't assign `unknown[]` to it,
          // then it must hold some known/homogenous type. Use this to infer the
          // param types in the case of an `Array.map()` argument.
          calls extends readonly (infer call extends OneOf<
              Call<unknown, extraProperties>
            >)[]
          ? readonly Prettify<call>[]
          : // Fallback
            readonly OneOf<Call>[]
