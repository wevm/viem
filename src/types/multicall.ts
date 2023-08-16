import type { Abi, AbiStateMutability, ExtractAbiFunctionNames } from 'abitype'

import type { ContractParameters, ContractReturnType } from './contract.js'

// Avoid TS depth-limit error in case of large array literal
type MAXIMUM_DEPTH = 20

export type MulticallContract<
  abi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  stateMutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ExtractAbiFunctionNames<
    abi extends Abi ? abi : Abi,
    stateMutability
  > = string,
> = { abi: abi; functionName: functionName }

export type MulticallContracts<
  contracts extends readonly MulticallContract[],
  properties extends Record<string, any> = object,
  ///
  result extends any[] = [],
  depth extends readonly number[] = [],
> = depth['length'] extends MAXIMUM_DEPTH
  ? (ContractParameters & properties)[]
  : contracts extends []
  ? []
  : contracts extends [infer head extends MulticallContract]
  ? [
      ...result,
      ContractParameters<head['abi'], 'pure' | 'view', head['functionName']> &
        properties,
    ]
  : contracts extends [
      infer head extends MulticallContract,
      ...infer tail extends readonly MulticallContract[],
    ]
  ? MulticallContracts<
      [...tail],
      properties,
      [
        ...result,
        ContractParameters<head['abi'], 'pure' | 'view', head['functionName']> &
          properties,
      ],
      [...depth, 1]
    >
  : unknown[] extends contracts
  ? contracts
  : // If `contracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  contracts extends ContractParameters<infer abi, infer _, infer functionName>[]
  ? (ContractParameters<abi, 'pure' | 'view', functionName> & properties)[]
  : // Fallback
    (ContractParameters & properties)[]

export type MulticallResults<
  contracts extends readonly MulticallContract[],
  allowFailure extends boolean = true,
  ///
  result extends any[] = [],
  depth extends readonly number[] = [],
> = depth['length'] extends MAXIMUM_DEPTH
  ? MulticallResult<ContractReturnType, allowFailure>[]
  : contracts extends []
  ? []
  : contracts extends [infer head extends MulticallContract]
  ? [
      ...result,
      MulticallResult<
        ContractReturnType<head['abi'], 'pure' | 'view', head['functionName']>,
        allowFailure
      >,
    ]
  : contracts extends [
      infer head extends MulticallContract,
      ...infer tail extends readonly MulticallContract[],
    ]
  ? MulticallResults<
      [...tail],
      allowFailure,
      [
        ...result,
        MulticallResult<
          ContractReturnType<
            head['abi'],
            'pure' | 'view',
            head['functionName']
          >,
          allowFailure
        >,
      ],
      [...depth, 1]
    >
  : contracts extends ContractParameters<
      infer abi,
      infer _,
      infer functionName
    >[]
  ? // Dynamic-size (homogenous) UseQueryOptions array: map directly to array of results
    MulticallResult<
      ContractReturnType<abi, 'pure' | 'view', functionName>,
      allowFailure
    >[]
  : // Fallback
    MulticallResult<ContractReturnType, allowFailure>[]

export type MulticallResult<
  result,
  allowFailure extends boolean = true,
> = allowFailure extends true
  ?
      | { error?: undefined; result: result; status: 'success' }
      | { error: Error; result?: undefined; status: 'failure' }
  : result
