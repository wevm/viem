import type { Abi } from 'abitype'

import type {
  ContractFunctionConfig,
  ContractFunctionResult,
} from './contract.js'

type MAXIMUM_DEPTH = 20

export type Contract<
  TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  TFunctionName extends string = string,
> = { abi: TAbi; functionName: TFunctionName }

export type MulticallContracts<
  TContracts extends Contract[],
  TProperties extends Record<string, any> = object,
  Result extends any[] = [],
  Depth extends readonly number[] = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? (ContractFunctionConfig & TProperties)[]
  : TContracts extends []
  ? []
  : TContracts extends [infer Head extends Contract]
  ? [
      ...Result,
      ContractFunctionConfig<Head['abi'], Head['functionName']> & TProperties,
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
        ContractFunctionConfig<Head['abi'], Head['functionName']> & TProperties,
      ],
      [...Depth, 1]
    >
  : unknown[] extends TContracts
  ? TContracts
  : // If `TContracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  TContracts extends ContractFunctionConfig<infer TAbi, infer TFunctionName>[]
  ? (ContractFunctionConfig<TAbi, TFunctionName> & TProperties)[]
  : (ContractFunctionConfig & TProperties)[]

export type MulticallResult<
  Result,
  TAllowFailure extends boolean = true,
> = TAllowFailure extends true
  ?
      | {
          error?: undefined
          result: Result
          status: 'success'
        }
      | {
          error: Error
          result?: undefined
          status: 'failure'
        }
  : Result

export type MulticallResults<
  TContracts extends Contract[],
  TAllowFailure extends boolean = true,
  Result extends any[] = [],
  Depth extends readonly number[] = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? MulticallResult<ContractFunctionResult, TAllowFailure>[]
  : TContracts extends []
  ? []
  : TContracts extends [infer Head extends Contract]
  ? [
      ...Result,
      MulticallResult<
        ContractFunctionResult<Head['abi'], Head['functionName']>,
        TAllowFailure
      >,
    ]
  : TContracts extends [
      infer Head extends Contract,
      ...infer Tail extends Contract[],
    ]
  ? MulticallResults<
      [...Tail],
      TAllowFailure,
      [
        ...Result,
        MulticallResult<
          ContractFunctionResult<Head['abi'], Head['functionName']>,
          TAllowFailure
        >,
      ],
      [...Depth, 1]
    >
  : TContracts extends ContractFunctionConfig<infer TAbi, infer TFunctionName>[]
  ? MulticallResult<
      ContractFunctionResult<TAbi, TFunctionName>,
      TAllowFailure
    >[]
  : MulticallResult<ContractFunctionResult, TAllowFailure>[]
