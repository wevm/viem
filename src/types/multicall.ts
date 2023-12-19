import type { Abi, ExtractAbiFunctionNames } from 'abitype'

import type {
  ContractFunctionConfig,
  ContractFunctionResult,
} from './contract.js'

type MAXIMUM_DEPTH = 20

export type MulticallContract<
  TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  TFunctionName extends ExtractAbiFunctionNames<
    TAbi extends Abi ? TAbi : Abi,
    'pure' | 'view'
  > = string,
> = { abi: TAbi; functionName: TFunctionName }

export type MulticallContracts<
  TContracts extends readonly MulticallContract[],
  TProperties extends Record<string, any> = object,
  Result extends any[] = [],
  Depth extends readonly number[] = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? (ContractFunctionConfig & TProperties)[]
  : TContracts extends []
    ? []
    : TContracts extends [infer Head extends MulticallContract]
      ? [
          ...Result,
          ContractFunctionConfig<Head['abi'], Head['functionName']> &
            TProperties,
        ]
      : TContracts extends [
            infer Head extends MulticallContract,
            ...infer Tail extends readonly MulticallContract[],
          ]
        ? MulticallContracts<
            [...Tail],
            TProperties,
            [
              ...Result,
              ContractFunctionConfig<Head['abi'], Head['functionName']> &
                TProperties,
            ],
            [...Depth, 1]
          >
        : unknown[] extends TContracts
          ? TContracts
          : // If `TContracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
            // use this to infer the param types in the case of Array.map() argument
            TContracts extends ContractFunctionConfig<
                infer TAbi,
                infer TFunctionName
              >[]
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
  TContracts extends readonly MulticallContract[],
  TAllowFailure extends boolean = true,
  Result extends any[] = [],
  Depth extends readonly number[] = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? MulticallResult<ContractFunctionResult, TAllowFailure>[]
  : TContracts extends []
    ? []
    : TContracts extends [infer Head extends MulticallContract]
      ? [
          ...Result,
          MulticallResult<
            ContractFunctionResult<Head['abi'], Head['functionName']>,
            TAllowFailure
          >,
        ]
      : TContracts extends [
            infer Head extends MulticallContract,
            ...infer Tail extends readonly MulticallContract[],
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
        : TContracts extends ContractFunctionConfig<
              infer TAbi,
              infer TFunctionName
            >[]
          ? MulticallResult<
              ContractFunctionResult<TAbi, TFunctionName>,
              TAllowFailure
            >[]
          : MulticallResult<ContractFunctionResult, TAllowFailure>[]
