import type {
  Abi,
  AbiEvent,
  AbiFunction,
  AbiParameter,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  AbiStateMutability,
  Address,
  ExtractAbiError,
  ExtractAbiErrorNames,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ResolvedRegister,
} from 'abitype'

import type { Hex, LogTopic } from './misc.js'
import type { TransactionRequest } from './transaction.js'
import type {
  Filter,
  IsNarrowable,
  IsUnion,
  MaybeRequired,
  NoInfer,
  Prettify,
  UnionToTuple,
} from './utils.js'

export type ContractFunctionName<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
> = ExtractAbiFunctionNames<
  abi extends Abi ? abi : Abi,
  mutability
> extends infer functionName extends string
  ? [functionName] extends [never]
    ? string
    : functionName
  : string

export type ContractErrorName<abi extends Abi | readonly unknown[] = Abi> =
  ExtractAbiErrorNames<
    abi extends Abi ? abi : Abi
  > extends infer errorName extends string
    ? [errorName] extends [never]
      ? string
      : errorName
    : string

export type ContractEventName<abi extends Abi | readonly unknown[] = Abi> =
  ExtractAbiEventNames<
    abi extends Abi ? abi : Abi
  > extends infer eventName extends string
    ? [eventName] extends [never]
      ? string
      : eventName
    : string

export type ContractFunctionArgs<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<
    abi,
    mutability
  > = ContractFunctionName<abi, mutability>,
> = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<
    abi extends Abi ? abi : Abi,
    functionName,
    mutability
  >['inputs'],
  'inputs'
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[]
    : args
  : readonly unknown[]

export type ContractConstructorArgs<
  abi extends Abi | readonly unknown[] = Abi,
> = AbiParametersToPrimitiveTypes<
  Extract<
    (abi extends Abi ? abi : Abi)[number],
    { type: 'constructor' }
  >['inputs'],
  'inputs'
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[]
    : args
  : readonly unknown[]

export type ContractErrorArgs<
  abi extends Abi | readonly unknown[] = Abi,
  errorName extends ContractErrorName<abi> = ContractErrorName<abi>,
> = AbiParametersToPrimitiveTypes<
  ExtractAbiError<abi extends Abi ? abi : Abi, errorName>['inputs'],
  'inputs'
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[]
    : args
  : readonly unknown[]

export type ContractEventArgs<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> = ContractEventName<abi>,
> = AbiEventParametersToPrimitiveTypes<
  ExtractAbiEvent<abi extends Abi ? abi : Abi, eventName>['inputs']
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[] | Record<string, unknown>
    : args
  : readonly unknown[] | Record<string, unknown>

export type ContractEventArgsFromTopics<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> = ContractEventName<abi>,
  strict extends boolean = true,
> = AbiEventParametersToPrimitiveTypes<
  ExtractAbiEvent<abi extends Abi ? abi : Abi, eventName>['inputs'],
  { EnableUnion: false; IndexedOnly: false; Required: strict }
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[] | Record<string, unknown>
    : args
  : readonly unknown[] | Record<string, unknown>

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

export type ExtractAbiFunctionForArgs<
  abi extends Abi,
  mutability extends AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability>,
  args extends ContractFunctionArgs<abi, mutability, functionName>,
> = ExtractAbiFunction<
  abi,
  functionName,
  mutability
> extends infer abiFunction extends AbiFunction
  ? IsUnion<abiFunction> extends true // narrow overloads using `args` by converting to tuple and filtering out overloads that don't match
    ? UnionToTuple<abiFunction> extends infer abiFunctions extends
        readonly AbiFunction[]
      ? // convert back to union (removes `never` tuple entries)
        { [k in keyof abiFunctions]: CheckArgs<abiFunctions[k], args> }[number]
      : never
    : abiFunction
  : never
type CheckArgs<
  abiFunction extends AbiFunction,
  args,
  ///
  targetArgs extends AbiParametersToPrimitiveTypes<
    abiFunction['inputs'],
    'inputs'
  > = AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>,
> = (readonly [] extends args ? readonly [] : args) extends targetArgs // fallback to `readonly []` if `args` has no value (e.g. `args` property not provided)
  ? abiFunction
  : never

export type ContractFunctionParameters<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<
    abi,
    mutability
  > = ContractFunctionName<abi, mutability>,
  args extends ContractFunctionArgs<
    abi,
    mutability,
    functionName
  > = ContractFunctionArgs<abi, mutability, functionName>,
  deployless extends boolean = false,
  ///
  allFunctionNames = ContractFunctionName<abi, mutability>,
  allArgs = ContractFunctionArgs<abi, mutability, functionName>,
  // when `args` is inferred to `readonly []` ("inputs": []) or `never` (`abi` declared as `Abi` or not inferrable), allow `args` to be optional.
  // important that both branches return same structural type
> = {
  abi: abi
  functionName:
    | allFunctionNames // show all options
    | (functionName extends allFunctionNames ? functionName : never) // infer value
  args?: (abi extends Abi ? UnionWiden<args> : never) | allArgs | undefined
} & (readonly [] extends allArgs ? {} : { args: Widen<args> }) &
  (deployless extends true
    ? { address?: undefined; code: Hex }
    : { address: Address })

export type ContractFunctionReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<
    abi,
    mutability
  > = ContractFunctionName<abi, mutability>,
  args extends ContractFunctionArgs<
    abi,
    mutability,
    functionName
  > = ContractFunctionArgs<abi, mutability, functionName>,
> = abi extends Abi
  ? Abi extends abi
    ? unknown
    : AbiParametersToPrimitiveTypes<
          ExtractAbiFunctionForArgs<
            abi,
            mutability,
            functionName,
            args
          >['outputs']
        > extends infer types
      ? types extends readonly []
        ? void
        : types extends readonly [infer type]
          ? type
          : types
      : never
  : unknown

export type AbiItem = Abi[number]

export type ExtractAbiItemNames<abi extends Abi> = Extract<
  abi[number],
  { name: string }
>['name']

export type ExtractAbiItem<
  abi extends Abi,
  name extends ExtractAbiItemNames<abi>,
> = Extract<abi[number], { name: name }>

export type AbiItemName<abi extends Abi | readonly unknown[] = Abi> =
  abi extends Abi ? ExtractAbiItemNames<abi> : string

export type AbiItemArgs<
  abi extends Abi | readonly unknown[] = Abi,
  name extends AbiItemName<abi> = AbiItemName<abi>,
> = AbiParametersToPrimitiveTypes<
  ExtractAbiItem<abi extends Abi ? abi : Abi, name>['inputs'],
  'inputs'
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[]
    : args
  : readonly unknown[]

export type ExtractAbiItemForArgs<
  abi extends Abi,
  name extends AbiItemName<abi>,
  args extends AbiItemArgs<abi, name>,
> = ExtractAbiItem<abi, name> extends infer abiItem extends AbiItem & {
  inputs: readonly AbiParameter[]
}
  ? IsUnion<abiItem> extends true // narrow overloads using `args` by converting to tuple and filtering out overloads that don't match
    ? UnionToTuple<abiItem> extends infer abiItems extends readonly (AbiItem & {
        inputs: readonly AbiParameter[]
      })[]
      ? {
          [k in keyof abiItems]: (
            readonly [] extends args
              ? readonly [] // fallback to `readonly []` if `args` has no value (e.g. `args` property not provided)
              : args
          ) extends AbiParametersToPrimitiveTypes<
            abiItems[k]['inputs'],
            'inputs'
          >
            ? abiItems[k]
            : never
        }[number] // convert back to union (removes `never` tuple entries: `['foo', never, 'bar'][number]` => `'foo' | 'bar'`)
      : never
    : abiItem
  : never

export type EventDefinition = `${string}(${string})`

export type GetValue<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TValueType = TransactionRequest['value'],
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  _Narrowable extends boolean = IsNarrowable<TAbi, Abi>,
> = _Narrowable extends true
  ? TAbiFunction['stateMutability'] extends 'payable'
    ? { value?: NoInfer<TValueType> | undefined }
    : TAbiFunction['payable'] extends true
      ? { value?: NoInfer<TValueType> | undefined }
      : { value?: undefined }
  : { value?: NoInfer<TValueType> | undefined }

//////////////////////////////////////////////////////////////////////////////////////////////////

export type MaybeAbiEventName<TAbiEvent extends AbiEvent | undefined> =
  TAbiEvent extends AbiEvent ? TAbiEvent['name'] : undefined

export type MaybeExtractEventArgsFromAbi<
  TAbi extends Abi | readonly unknown[] | undefined,
  TEventName extends string | undefined,
> = TAbi extends Abi | readonly unknown[]
  ? TEventName extends string
    ? GetEventArgs<TAbi, TEventName>
    : undefined
  : undefined

//////////////////////////////////////////////////////////////////////
// ABI item args

export type GetEventArgs<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TConfig extends EventParameterOptions = DefaultEventParameterOptions,
  TAbiEvent extends AbiEvent & { type: 'event' } = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent & { type: 'event' },
  TArgs = AbiEventParametersToPrimitiveTypes<TAbiEvent['inputs'], TConfig>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false),
> = true extends FailedToParseArgs
  ? readonly unknown[] | Record<string, unknown>
  : TArgs

//////////////////////////////////////////////////////////////////////
// ABI event types

type EventParameterOptions = {
  EnableUnion?: boolean
  IndexedOnly?: boolean
  Required?: boolean
}
type DefaultEventParameterOptions = {
  EnableUnion: true
  IndexedOnly: true
  Required: false
}

export type AbiEventParametersToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  Options extends EventParameterOptions = DefaultEventParameterOptions,
  // Remove non-indexed parameters based on `Options['IndexedOnly']`
> = TAbiParameters extends readonly []
  ? readonly []
  : Filter<
        TAbiParameters,
        Options['IndexedOnly'] extends true ? { indexed: true } : object
      > extends infer Filtered extends readonly AbiParameter[]
    ? _HasUnnamedAbiParameter<Filtered> extends true
      ? // Has unnamed tuple parameters so return as array
          | readonly [
              ...{
                [K in keyof Filtered]: AbiEventParameterToPrimitiveType<
                  Filtered[K],
                  Options
                >
              },
            ]
          // Distribute over tuple to represent optional parameters
          | (Options['Required'] extends true
              ? never
              : // Distribute over tuple to represent optional parameters
                Filtered extends readonly [
                    ...infer Head extends readonly AbiParameter[],
                    infer _,
                  ]
                ? AbiEventParametersToPrimitiveTypes<
                    readonly [...{ [K in keyof Head]: Omit<Head[K], 'name'> }],
                    Options
                  >
                : never)
      : // All tuple parameters are named so return as object
        {
            [Parameter in Filtered[number] as Parameter extends {
              name: infer Name extends string
            }
              ? Name
              : never]?:
              | AbiEventParameterToPrimitiveType<Parameter, Options>
              | undefined
          } extends infer Mapped
        ? Prettify<
            MaybeRequired<
              Mapped,
              Options['Required'] extends boolean ? Options['Required'] : false
            >
          >
        : never
    : never

// TODO: Speed up by returning immediately as soon as named parameter is found.
type _HasUnnamedAbiParameter<TAbiParameters extends readonly AbiParameter[]> =
  TAbiParameters extends readonly [
    infer Head extends AbiParameter,
    ...infer Tail extends readonly AbiParameter[],
  ]
    ? Head extends { name: string }
      ? Head['name'] extends ''
        ? true
        : _HasUnnamedAbiParameter<Tail>
      : true
    : false

/**
 * @internal
 */
export type LogTopicType<
  TPrimitiveType = Hex,
  TTopic extends LogTopic = LogTopic,
> = TTopic extends Hex
  ? TPrimitiveType
  : TTopic extends Hex[]
    ? TPrimitiveType[]
    : TTopic extends null
      ? null
      : never

/**
 * @internal
 */
export type AbiEventParameterToPrimitiveType<
  TAbiParameter extends AbiParameter,
  Options extends EventParameterOptions = DefaultEventParameterOptions,
  _Type = AbiParameterToPrimitiveType<TAbiParameter>,
> = Options['EnableUnion'] extends true ? LogTopicType<_Type> : _Type

type HashedEventTypes = 'bytes' | 'string' | 'tuple' | `${string}[${string}]`

/**
 * @internal
 */
export type AbiEventTopicToPrimitiveType<
  TAbiParameter extends AbiParameter,
  TTopic extends LogTopic,
  TPrimitiveType = TAbiParameter['type'] extends HashedEventTypes
    ? TTopic
    : AbiParameterToPrimitiveType<TAbiParameter>,
> = LogTopicType<TPrimitiveType, TTopic>
