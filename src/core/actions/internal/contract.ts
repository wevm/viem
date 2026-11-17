import type {
  Abi,
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  AbiStateMutability,
  Address,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ResolvedRegister,
} from 'abitype'
import type { AbiFunction as ox_AbiFunction, Hex } from 'ox'

import type {
  IsNarrowable,
  IsUnion,
  NoInfer,
  UnionToTuple,
} from '../../internal/types.js'

/** Extracts the callable function names from an `abi` for a given `mutability`. */
export type ContractFunctionName<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
> =
  ExtractAbiFunctionNames<
    abi extends Abi ? abi : Abi,
    mutability
  > extends infer functionName extends string
    ? [functionName] extends [never]
      ? string
      : functionName
    : string

/** Extracts the input argument tuple for a function on an `abi`. */
export type ContractFunctionArgs<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> =
    ContractFunctionName<abi, mutability>,
> =
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      abi extends Abi ? abi : Abi,
      functionName,
      mutability
    >['inputs'],
    'inputs',
    true
  > extends infer args
    ? [args] extends [never]
      ? readonly unknown[]
      : args
    : readonly unknown[]

/** Extracts the input argument tuple for a contract constructor. */
export type ContractConstructorArgs<
  abi extends Abi | readonly unknown[] = Abi,
> =
  AbiParametersToPrimitiveTypes<
    Extract<
      (abi extends Abi ? abi : Abi)[number],
      { type: 'constructor' }
    >['inputs'],
    'inputs',
    true
  > extends infer args
    ? [args] extends [never]
      ? readonly unknown[]
      : args
    : readonly unknown[]

/** Widens a literal type to its base type (used to relax inferred `args`). */
export type Widen<type> =
  | ([unknown] extends [type] ? unknown : never)
  | (type extends Function ? type : never)
  | (type extends ResolvedRegister['BigIntType'] ? bigint : never)
  | (type extends boolean ? boolean : never)
  | (type extends ResolvedRegister['IntType'] ? number : never)
  | (type extends string
      ? type extends ResolvedRegister['AddressType']
        ? ResolvedRegister['AddressType']
        : type extends ResolvedRegister['BytesType']['inputs']
          ? ResolvedRegister['BytesType']
          : string
      : never)
  | (type extends readonly [] ? readonly [] : never)
  | (type extends Record<string, unknown>
      ? { [K in keyof type]: Widen<type[K]> }
      : never)
  | (type extends { length: number }
      ? {
          [K in keyof type]: Widen<type[K]>
        } extends infer Val extends readonly unknown[]
        ? readonly [...Val]
        : never
      : never)

export type UnionWiden<type> = type extends any ? Widen<type> : never

/** Narrows overloaded functions down to the overload matching `args`. */
export type ExtractAbiFunctionForArgs<
  abi extends Abi,
  mutability extends AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability>,
  args extends ContractFunctionArgs<abi, mutability, functionName>,
> =
  ExtractAbiFunction<
    abi,
    functionName,
    mutability
  > extends infer abiFunction extends AbiFunction
    ? IsUnion<abiFunction> extends true
      ? UnionToTuple<abiFunction> extends infer abiFunctions extends
          readonly AbiFunction[]
        ? {
            [k in keyof abiFunctions]: CheckArgs<abiFunctions[k], args>
          }[number]
        : never
      : abiFunction
    : never

type CheckArgs<
  abiFunction extends AbiFunction,
  args,
  ///
  targetArgs extends AbiParametersToPrimitiveTypes<
    abiFunction['inputs'],
    'inputs',
    true
  > = AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs', true>,
> = (readonly [] extends args ? readonly [] : args) extends targetArgs
  ? abiFunction
  : never

/**
 * Resolves the `value` field for a write/simulate action so it is only offered
 * when the targeted function is `payable` (and forbidden otherwise).
 */
export type GetMutabilityAwareValue<
  abi extends Abi | readonly unknown[],
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> =
    ContractFunctionName<abi, mutability>,
  valueType = bigint,
  args extends ContractFunctionArgs<abi, mutability, functionName> =
    ContractFunctionArgs<abi, mutability, functionName>,
  abiFunction extends AbiFunction = abi extends Abi
    ? ExtractAbiFunctionForArgs<abi, mutability, functionName, args>
    : AbiFunction,
  _Narrowable extends boolean = IsNarrowable<abi, Abi>,
> = _Narrowable extends true
  ? abiFunction['stateMutability'] extends 'payable'
    ? { value?: NoInfer<valueType> | undefined }
    : abiFunction['payable'] extends true
      ? { value?: NoInfer<valueType> | undefined }
      : { value?: undefined }
  : { value?: NoInfer<valueType> | undefined }

/**
 * The shared input shape for contract actions: `abi` + `functionName` (with all
 * names offered for completion) + `args` (narrowed to the matching overload),
 * plus the `address`/`code` target.
 */
export type ContractFunctionParameters<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> =
    ContractFunctionName<abi, mutability>,
  args extends ContractFunctionArgs<abi, mutability, functionName> =
    ContractFunctionArgs<abi, mutability, functionName>,
  deployless extends boolean = false,
  ///
  allFunctionNames = ContractFunctionName<abi, mutability>,
  allArgs = ContractFunctionArgs<abi, mutability, functionName>,
  abiFunction = ExtractAbiFunction<
    abi extends Abi ? abi : Abi,
    functionName,
    mutability
  >,
> = {
  abi: abi
  functionName:
    | allFunctionNames
    | (functionName extends allFunctionNames ? functionName : never)
} & (readonly [] extends allArgs
  ? {
      args?:
        | allArgs
        | (abi extends Abi
            ? Abi extends abi
              ? never
              : UnionWiden<IsUnion<abiFunction> extends true ? args : allArgs>
            : never)
        | undefined
    }
  : {
      args: IsUnion<abiFunction> extends true ? args : allArgs
    }) &
  (deployless extends true
    ? {
        address?: undefined
        code: Hex.Hex
      }
    : {
        address: Address
      })

/** Decodes a function's return type from an `abi` + `functionName` + `args`. */
export type ContractFunctionReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> =
    ContractFunctionName<abi, mutability>,
  args extends ContractFunctionArgs<abi, mutability, functionName> =
    ContractFunctionArgs<abi, mutability, functionName>,
  as extends 'Object' | 'Array' = 'Object',
> = abi extends Abi
  ? Abi extends abi
    ? unknown
    : ExtractAbiFunctionForArgs<
          abi,
          mutability,
          functionName,
          args
        > extends infer abiFunction extends AbiFunction
      ? ox_AbiFunction.decodeResult.ReturnType<
          abiFunction,
          ResolveReturnShape<abiFunction['outputs'], as>
        >
      : unknown
  : unknown

/** Decode shape for `outputs` under `as`: fully unnamed outputs stay tuples. */
type ResolveReturnShape<
  outputs extends readonly unknown[],
  as extends 'Object' | 'Array',
> = as extends 'Array'
  ? 'Array'
  : true extends {
        [index in keyof outputs]: outputs[index] extends {
          name: infer name extends string
        }
          ? '' extends name
            ? false
            : true
          : false
      }[number]
    ? 'Object'
    : 'Array'

/** Resolves the decode shape of `abiItem`: fully unnamed outputs stay tuples. */
export function resolveReturnShape(
  abiItem: { outputs?: readonly { name?: string | undefined }[] | undefined },
  as: 'Object' | 'Array',
): 'Object' | 'Array' {
  if (as === 'Array') return 'Array'
  return (abiItem.outputs ?? []).some((output) => output.name)
    ? 'Object'
    : 'Array'
}
