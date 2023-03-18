import type { Abi } from 'abitype';
import type { ContractConfig, ExtractResultFromAbi } from './contract';

type MAXIMUM_DEPTH = 20

export type Contract<
  TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  TFunctionName extends string = string,
> = { abi: TAbi; functionName: TFunctionName }

export type MulticallContracts<
  TContracts extends Contract[],
  TProperties extends Record<string, any> = object,
  Result extends any[] = [],
  Depth extends ReadonlyArray<number> = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? (ContractConfig & TProperties)[]
  : TContracts extends []
  ? []
  : TContracts extends [infer Head extends Contract]
  ? [
      ...Result,
      ContractConfig<Head['abi'], Head['functionName']> &
        TProperties,
    ]
  : TContracts extends [
      infer Head extends Contract,
      ...infer Tail extends Contract[],
    ]
  ? MulticallContracts<
      [...Tail],
      TProperties,
      [
        ...Result,
        ContractConfig<Head['abi'], Head['functionName']> &
          TProperties,
      ],
      [...Depth, 1]
    >
  : unknown[] extends TContracts
  ? TContracts
  : // If `TContracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  TContracts extends ContractConfig<infer TAbi, infer TFunctionName>[]
  ? (ContractConfig<TAbi, TFunctionName> & TProperties)[]
  : (ContractConfig & TProperties)[]


export type MulticallResult<Result, TAllowFailure extends boolean = true> = TAllowFailure extends true ? ({
  error?: undefined
  result: Result
  status: 'success'
} | {
  error: Error
  result?: undefined
  status: 'error'
}) : Result

export type MulticallResults<
  TContracts extends Contract[],
  TAllowFailure extends boolean = true,
  Result extends any[] = [],
  Depth extends ReadonlyArray<number> = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? MulticallResult<ExtractResultFromAbi, TAllowFailure>[]
  : TContracts extends []
  ? []
  : TContracts extends [infer Head extends Contract]
  ? [...Result, MulticallResult<ExtractResultFromAbi<Head['abi'], Head['functionName']>, TAllowFailure>]
  : TContracts extends [
      infer Head extends Contract,
      ...infer Tail extends Contract[],
    ]
  ? MulticallResults<
      [...Tail],
      TAllowFailure,
      [...Result, MulticallResult<ExtractResultFromAbi<Head['abi'], Head['functionName']>, TAllowFailure>],
      [...Depth, 1]
    >
  : TContracts extends ContractConfig<infer TAbi, infer TFunctionName>[]
  ? MulticallResult<ExtractResultFromAbi<TAbi, TFunctionName>, TAllowFailure>[]
  : MulticallResult<ExtractResultFromAbi, TAllowFailure>[]