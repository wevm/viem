import type { Abi, AbiStateMutability } from 'abitype'
import type { Address, Hex } from 'ox'

import type { Assign, OneOf, Prettify } from '../../internal/types.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ContractFunctionReturnType,
} from './contract.js'

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

/** A list of {@link Calls} batches, preserving per-call inference. */
export type Batches<
  batches extends readonly { calls: readonly unknown[] }[],
  properties extends Record<string, unknown> = {},
  ///
  result extends readonly any[] = [],
> = batches extends readonly [infer batch extends { calls: readonly unknown[] }]
  ? readonly [...result, { calls: Calls<batch['calls']> } & properties]
  : batches extends readonly [
        infer batch extends { calls: readonly unknown[] },
        ...infer rest extends readonly { calls: readonly unknown[] }[],
      ]
    ? Batches<
        [...rest],
        properties,
        [...result, { calls: Calls<batch['calls']> } & properties]
      >
    : batches

/** Result of a single {@link Call} in a batch. */
export type CallResult<
  result = unknown,
  allowFailure extends boolean = true,
  options extends {
    error?: Error
    extraProperties?: Record<string, unknown>
  } = { error: Error; extraProperties: {} },
> = allowFailure extends true
  ?
      | Prettify<
          options['extraProperties'] & {
            error?: undefined
            result: result
            status: 'success'
          }
        >
      | Prettify<
          options['extraProperties'] & {
            error: unknown extends options['error'] ? Error : options['error']
            result?: undefined
            status: 'failure'
          }
        >
  : result

/** Per-call results of a batched call action, preserving per-call inference. */
export type CallResults<
  calls extends readonly unknown[],
  allowFailure extends boolean = true,
  options extends {
    error?: Error
    extraProperties?: Record<string, unknown>
    mutability: AbiStateMutability
  } = { error: Error; extraProperties: {}; mutability: AbiStateMutability },
  ///
  result extends readonly any[] = [],
> = calls extends readonly [] // no calls, return empty
  ? readonly []
  : calls extends readonly [infer call] // one call left before returning `result`
    ? readonly [
        ...result,
        CallResult<
          CallReturnType<call, options['mutability']>,
          allowFailure,
          options
        >,
      ]
    : calls extends readonly [infer call, ...infer rest] // grab first call and recurse through `rest`
      ? CallResults<
          [...rest],
          allowFailure,
          options,
          [
            ...result,
            CallResult<
              CallReturnType<call, options['mutability']>,
              allowFailure,
              options
            >,
          ]
        >
      : readonly unknown[] extends calls
        ? readonly CallResult<unknown, allowFailure, options>[]
        : // If `calls` is *some* array but we couldn't assign `unknown[]` to it,
          // then it must hold some known/homogenous type.
          calls extends readonly (infer call extends OneOf<Call>)[]
          ? readonly CallResult<
              CallReturnType<call, options['mutability']>,
              allowFailure,
              options
            >[]
          : // Fallback
            readonly CallResult<unknown, allowFailure, options>[]

/** Extracts the decoded return type of a {@link Call}. */
type CallReturnType<
  call,
  mutability extends AbiStateMutability,
> = call extends { abi: infer abi extends Abi }
  ? call extends {
      functionName: infer functionName extends ContractFunctionName<
        abi,
        mutability
      >
    }
    ? call extends {
        args: infer args extends ContractFunctionArgs<
          abi,
          mutability,
          functionName
        >
      }
      ? ContractFunctionReturnType<abi, mutability, functionName, args>
      : ContractFunctionReturnType<abi, mutability, functionName>
    : ContractFunctionReturnType<abi, mutability>
  : unknown
