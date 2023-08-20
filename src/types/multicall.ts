import type { Abi, AbiStateMutability } from 'abitype'

import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ContractFunctionReturnType,
} from './contract.js'
import type { MaybePartial } from './utils.js'

export type MulticallContracts<
  contracts extends readonly unknown[],
  options extends {
    mutability: AbiStateMutability
    optional?: boolean
    properties?: Record<string, any>
  } = { mutability: AbiStateMutability },
  ///
  result extends readonly any[] = [],
> = contracts extends readonly [] // no contracts, return empty
  ? readonly []
  : contracts extends readonly [infer contract] // one contract left before returning `result`
  ? readonly [
      ...result,
      MaybePartial<
        GetMulticallContractParameters<contract, options['mutability']> &
          options['properties'],
        options['optional']
      >,
    ]
  : contracts extends readonly [infer contract, ...infer rest] // grab first contract and recurse through `rest`
  ? MulticallContracts<
      [...rest],
      options,
      [
        ...result,
        MaybePartial<
          GetMulticallContractParameters<contract, options['mutability']> &
            options['properties'],
          options['optional']
        >,
      ]
    >
  : readonly unknown[] extends contracts
  ? contracts
  : // If `contracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  contracts extends readonly ContractFunctionParameters<
      infer abi,
      infer _,
      infer functionName,
      infer args
    >[]
  ? readonly MaybePartial<
      ContractFunctionParameters<
        abi,
        options['mutability'],
        functionName,
        args
      > &
        options['properties'],
      options['optional']
    >[]
  : // Fallback
    readonly MaybePartial<
      ContractFunctionParameters & options['properties'],
      options['optional']
    >[]

export type MulticallResults<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    error?: Error
    mutability: AbiStateMutability
  } = { error: Error; mutability: AbiStateMutability },
> = {
  [index in keyof contracts]: MulticallResponse<
    GetMulticallContractReturnType<contracts[index], options['mutability']>,
    options['error'],
    allowFailure
  >
}

export type MulticallResponse<
  result = unknown,
  error = unknown,
  allowFailure extends boolean = true,
> = allowFailure extends true
  ?
      | { error?: undefined; result: result; status: 'success' }
      | {
          error: unknown extends error ? Error : error
          result?: undefined
          status: 'failure'
        }
  : result

// infer contract parameters from `unknown`
type GetMulticallContractParameters<
  contract,
  mutability extends AbiStateMutability,
> = contract extends { abi: infer abi extends Abi } // 1. Check if `abi` is const-asserted or defined inline
  ? // 1a. Check if `functionName` is valid for `abi`
    contract extends {
      functionName: infer functionName extends ContractFunctionName<
        abi,
        mutability
      >
    }
    ? // 1aa. Check if `args` is valid for `abi` and `functionName`
      contract extends {
        args: infer args extends ContractFunctionArgs<
          abi,
          mutability,
          functionName
        >
      }
      ? ContractFunctionParameters<abi, mutability, functionName, args> // `args` valid, pass through
      : ContractFunctionParameters<abi, mutability, functionName> // invalid `args`
    : // 1b. `functionName` is invalid, check if `abi` is declared as `Abi`
    Abi extends abi
    ? ContractFunctionParameters // `abi` declared as `Abi`, unable to infer types further
    : // `abi` is const-asserted or defined inline, infer types for `functionName` and `args`
      ContractFunctionParameters<abi, mutability>
  : ContractFunctionParameters<readonly unknown[]> // invalid `contract['abi']`, set to `readonly unknown[]`

type GetMulticallContractReturnType<
  contract,
  mutability extends AbiStateMutability,
> = contract extends { abi: infer abi extends Abi } // 1. Check if `abi` is const-asserted or defined inline
  ? // Check if `functionName` is valid for `abi`
    contract extends {
      functionName: infer functionName extends ContractFunctionName<
        abi,
        mutability
      >
    }
    ? // Check if `args` is valid for `abi` and `functionName`
      contract extends {
        args: infer args extends ContractFunctionArgs<
          abi,
          mutability,
          functionName
        >
      }
      ? ContractFunctionReturnType<abi, mutability, functionName, args> // `args` valid, pass through
      : ContractFunctionReturnType<abi, mutability, functionName> // invalid `args`
    : ContractFunctionReturnType<abi, mutability> // Invalid `functionName`
  : ContractFunctionReturnType // invalid `contract['abi']` (not const-asserted or declared as `Abi`)
