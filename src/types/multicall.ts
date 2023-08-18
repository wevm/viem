import type { Abi, AbiStateMutability, Address } from 'abitype'

import type {
  Args,
  ContractFunctionReturnType,
  FunctionName,
  Widen,
} from './contract.js'
import type { MaybePartial } from './utils.js'

export type MulticallContract<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends FunctionName<
    abi extends Abi ? abi : Abi,
    mutability
  > = string,
  args extends Args<
    abi extends Abi ? abi : Abi,
    mutability,
    functionName
  > = Args<abi extends Abi ? abi : Abi, mutability, functionName>,
> = readonly [] extends args
  ? {
      address: Address
      abi: abi
      functionName:
        | functionName
        | FunctionName<abi extends Abi ? abi : Abi, mutability>
      args?:
        | Widen<args>
        | Args<abi extends Abi ? abi : Abi, mutability, functionName>
        | undefined
    }
  : {
      address: Address
      abi: abi
      functionName:
        | functionName
        | FunctionName<abi extends Abi ? abi : Abi, mutability>
      args:
        | Widen<args>
        | Args<abi extends Abi ? abi : Abi, mutability, functionName>
    }

export type MulticallContracts<
  contracts extends readonly unknown[],
  options extends {
    mutability: AbiStateMutability
    optional?: boolean
    properties?: Record<string, any>
  } = { mutability: AbiStateMutability },
  ///
  result extends readonly any[] = [],
> = contracts extends readonly []
  ? readonly []
  : contracts extends readonly [infer contract] // One contract left before returning `result`
  ? readonly [
      ...result,
      GetMulticallContract<contract, options['mutability']> extends [never] // If `GetContract` returns `never`, then `contract` is invalid
        ? // Fallback to just `abi`
          MaybePartial<
            Omit<MulticallContract, 'args'> & {
              args?: readonly unknown[] | undefined
            } & options['properties'],
            options['optional']
          >
        : // We know `contract` is inferrable, let's get to it!
          MaybePartial<
            GetMulticallContract<contract, options['mutability']> &
              options['properties'],
            options['optional']
          >,
    ]
  : contracts extends readonly [infer contract, ...infer rest] // Grab first contract and recurse
  ? MulticallContracts<
      [...rest],
      options,
      [
        ...result,
        GetMulticallContract<contract, options['mutability']> extends [never] // If `GetContract` returns `never`, then `contract` is invalid
          ? // Fallback to just `abi`
            MaybePartial<
              Omit<MulticallContract, 'args'> & {
                args?: readonly unknown[] | undefined
              } & options['properties'],
              options['optional']
            >
          : // We know `contract` is inferrable, let's get to it!
            MaybePartial<
              GetMulticallContract<contract, options['mutability']> &
                options['properties'],
              options['optional']
            >,
      ]
    >
  : readonly unknown[] extends contracts
  ? contracts
  : // If `contracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  contracts extends readonly MulticallContract<
      infer abi,
      infer _,
      infer functionName,
      infer args
    >[]
  ? readonly MaybePartial<
      MulticallContract<abi, options['mutability'], functionName, args> &
        options['properties'],
      options['optional']
    >[]
  : // Fallback
    readonly MaybePartial<
      MulticallContract & options['properties'],
      options['optional']
    >[]

export type MulticallResults<
  contracts extends readonly unknown[] = readonly MulticallContract[],
  allowFailure extends boolean = true,
  options extends {
    error?: Error
    mutability: AbiStateMutability
  } = { error: Error; mutability: AbiStateMutability },
> = {
  [index in keyof contracts]: ContractFunctionReturnType<
    contracts[index],
    options['mutability']
  > extends infer result
    ? [result] extends [never]
      ? MulticallResponse<unknown, options['error'], allowFailure>
      : MulticallResponse<result, options['error'], allowFailure>
    : never
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

type GetMulticallContract<
  contract,
  mutability extends AbiStateMutability,
> = contract extends { abi: infer abi extends Abi } // 1. Check if `abi` is const-asserted, defined inline, or declared as `Abi`
  ? // 1a. Check if `functionName` is valid for `abi`
    contract extends {
      functionName: infer functionName extends FunctionName<abi, mutability>
    }
    ? // 1aa. Check if `args` is valid for `abi` and `functionName`
      contract extends {
        args: infer args extends Args<abi, mutability, functionName>
      }
      ? // 1aa. Check if `args` can be empty
        readonly [] extends Args<abi, mutability, functionName>
        ? // `args` can be empty, mark `args` as `undefined`
          MulticallContract<abi, mutability, functionName, readonly []>
        : // `contract` is valid as-is, return it
          MulticallContract<abi, mutability, functionName, args>
      : // 1ab. `args` is invalid, infer types for `args`
      readonly [] extends Args<abi, mutability, functionName>
      ? // `args` can be empty, mark `args` as `undefined`
        MulticallContract<abi, mutability, functionName, readonly []>
      : // infer `args`
        MulticallContract<abi, mutability, functionName>
    : // 1b. `functionName` is invalid, check if `abi` is declared as `Abi`
    Abi extends abi
    ? // `abi` declared as `Abi`, unable to infer types further
      MulticallContract
    : // `abi` is const-asserted or defined inline, infer types for `functionName` and `args`
      Omit<MulticallContract<abi, mutability>, 'args' | 'functionName'> & {
        // setting `functionName` directly here because `MulticallContract` will allow invalid inputs otherwise (because of `functionName: functionName`)
        functionName: FunctionName<abi, mutability>
        // setting `args` directly here because `MulticallContract` has `Widen` in its definition,
        // which will cause that to show up in editor autocomplete for overloaded functions
        args: Args<abi, mutability, FunctionName<abi, mutability>>
      }
  : // 2. Check if `abi` property exists in `contract`
  contract extends { abi: infer abi }
  ? // 2a. `abi` exists in `contract`, check if `abi` is of type `Abi`
    abi extends Abi
    ? // return `unknown` since 1 handle type inference
      MulticallContract
    : // return default type since `abi` is not inferrable
      Omit<MulticallContract<readonly unknown[], mutability>, 'args'> & {
        // setting ars directly here because `MulticallContract` has `Widen` in its definition,
        // which will cause `never[]` to be inferred for `args` in this case
        args?: readonly unknown[] | undefined
      }
  : // 2b. `abi` property does not exist in `contract`, unable to infer types further
    // return `never`
    never
