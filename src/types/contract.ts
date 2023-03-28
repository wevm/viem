import type {
  Abi,
  AbiError,
  AbiEvent,
  AbiFunction,
  AbiParameter,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  AbiStateMutability,
  Address,
  ExtractAbiFunction,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiError,
  ExtractAbiErrorNames,
  ExtractAbiFunctionNames,
  Narrow,
  AbiConstructor,
} from 'abitype'
import type { Hex, LogTopic } from './misc'
import type { TransactionRequest } from './transaction'
import type { MaybeExcludeEmpty, MaybeRequired, Prettify } from './utils'

export type AbiItem = Abi[number]

export type EventDefinition = `${string}(${string})`

export type ContractFunctionConfig<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability,
> = {
  /** Contract ABI */
  abi: Narrow<TAbi>
  /** Contract address */
  address: Address
  /** Function to invoke on the contract */
  functionName: InferFunctionName<TAbi, TFunctionName, TAbiStateMutability>
} & GetFunctionArgs<TAbi, TFunctionName>

export type ContractFunctionResult<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAbiFunction extends AbiFunction & {
    type: 'function'
  } = TAbi extends Abi ? ExtractAbiFunction<TAbi, TFunctionName> : AbiFunction,
  TArgs = AbiParametersToPrimitiveTypes<TAbiFunction['outputs']>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false),
> = true extends FailedToParseArgs
  ? unknown
  : TArgs extends readonly []
  ? void
  : TArgs extends readonly [infer Arg]
  ? Arg
  : TArgs

// TODO
export type MaybeAbiEventName<TAbiEvent extends AbiEvent | undefined> =
  TAbiEvent extends AbiEvent ? TAbiEvent['name'] : undefined

// TODO
export type MaybeExtractEventArgsFromAbi<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = undefined,
> = TEventName extends string ? GetEventArgs<TAbi, TEventName> : undefined

export type GetValue<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TValueType = TransactionRequest['value'],
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
> = TAbiFunction['stateMutability'] extends 'payable'
  ? TValueType
  : TAbiFunction['payable'] extends true
  ? TValueType
  : never

//////////////////////////////////////////////////////////////////////
// ABI item name

export type InferErrorName<
  TAbi extends Abi | readonly unknown[] = Abi,
  TErrorName extends string = string,
> = TAbi extends Abi
  ? ExtractAbiErrorNames<TAbi> extends infer AbiErrorNames
    ?
        | AbiErrorNames
        | (TErrorName extends AbiErrorNames ? TErrorName : never)
        | (Abi extends TAbi ? string : never)
    : never
  : TErrorName

export type InferEventName<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
> = TAbi extends Abi
  ? ExtractAbiEventNames<TAbi> extends infer AbiEventNames
    ? AbiEventNames | (TEventName extends AbiEventNames ? TEventName : never)
    : never
  : TEventName

export type InferFunctionName<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability,
> = TAbi extends Abi
  ? ExtractAbiFunctionNames<
      TAbi,
      TAbiStateMutability
    > extends infer AbiFunctionNames
    ?
        | AbiFunctionNames
        | (TFunctionName extends AbiFunctionNames ? TFunctionName : never)
        | (Abi extends TAbi ? string : never)
    : never
  : TFunctionName

export type InferItemName<
  TAbi extends Abi | readonly unknown[] = Abi,
  TName extends string = string,
> = TAbi extends Abi
  ? ExtractAbiItemNames<TAbi> extends infer AbiNames
    ?
        | AbiNames
        | (TName extends AbiNames ? TName : never)
        | (Abi extends TAbi ? string : never)
    : never
  : TName
type ExtractAbiItemNames<TAbi extends Abi> =
  | ExtractAbiFunctionNames<TAbi>
  | ExtractAbiEventNames<TAbi>
  | ExtractAbiErrorNames<TAbi>

//////////////////////////////////////////////////////////////////////
// ABI item args

export type GetFunctionArgs<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  TArgs = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false),
> = true extends FailedToParseArgs
  ? {
      /**
       * Arguments to pass contract method
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link abi} for type inference.
       */
      args?: readonly unknown[]
    }
  : TArgs extends readonly []
  ? { args?: never }
  : {
      /** Arguments to pass contract method */ args: TArgs
    }

export type GetConstructorArgs<
  TAbi extends Abi | readonly unknown[],
  TAbiConstructor extends AbiConstructor = TAbi extends Abi
    ? Extract<TAbi[number], { type: 'constructor' }>
    : AbiConstructor,
  TArgs = AbiParametersToPrimitiveTypes<TAbiConstructor['inputs']>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false),
> = true extends FailedToParseArgs
  ? {
      /**
       * Arguments to pass contract constructor
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link abi} for type inference.
       */
      args?: readonly unknown[]
    }
  : TArgs extends readonly []
  ? { args?: never }
  : {
      /** Arguments to pass contract constructor */ args: TArgs
    }

export type GetErrorArgs<
  TAbi extends Abi | readonly unknown[],
  TErrorName extends string,
  TAbiError extends AbiError = TAbi extends Abi
    ? ExtractAbiError<TAbi, TErrorName>
    : AbiError,
  TArgs = AbiParametersToPrimitiveTypes<TAbiError['inputs']>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false),
> = true extends FailedToParseArgs
  ? {
      /**
       * Arguments to pass contract method
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link abi} for type inference.
       */
      args?: readonly unknown[]
    }
  : TArgs extends readonly []
  ? { args?: never }
  : {
      /** Arguments to pass contract method */ args: TArgs
    }

export type GetEventArgs<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TConfig extends EventParametersConfig = EventParametersDefaultConfig,
  TAbiEvent extends AbiEvent & { type: 'event' } = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent & { type: 'event' },
  TArgs = AbiEventParametersToPrimitiveTypes<TAbiEvent['inputs'], TConfig>,
  FailedToParseArgs =
    | ([TArgs] extends [never] ? true : false)
    | (readonly unknown[] extends TArgs ? true : false),
> = true extends FailedToParseArgs
  ? readonly unknown[]
  : TArgs extends readonly []
  ? never
  : TArgs

export type GetEventArgsFromTopics<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TTopics extends LogTopic[],
  TData extends Hex | undefined,
  TAbiEvent extends AbiEvent & { type: 'event' } = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent & { type: 'event' },
  TArgs = AbiEventTopicsToPrimitiveTypes<TAbiEvent['inputs'], TTopics, TData>,
> = TTopics extends readonly []
  ? TData extends undefined
    ? { args?: never }
    : { args?: TArgs }
  : {
      args?: TArgs
    }

//////////////////////////////////////////////////////////////////////
// ABI event types

type EventParametersConfig = {
  EnableUnion: boolean
  IndexedOnly: boolean
  Required: boolean
}

type EventParametersDefaultConfig = {
  EnableUnion: true
  IndexedOnly: true
  Required: false
}

type HashedEventTypes = 'bytes' | 'string' | 'tuple' | `${string}[${string}]`

/**
 * @internal
 */
export type DistributeLogTopicType<
  TPrimitiveType = Hex,
  TTopic extends LogTopic = LogTopic,
> =
  | (TTopic extends Hex ? TPrimitiveType : never)
  | (TTopic extends Hex[] ? TPrimitiveType[] : never)
  | (TTopic extends null ? null : never)

/**
 * @internal
 */
export type AbiEventParameterToPrimitiveType<
  TAbiParameter extends AbiParameter,
  TConfig extends EventParametersConfig = EventParametersDefaultConfig,
> = TConfig['EnableUnion'] extends true
  ? DistributeLogTopicType<AbiParameterToPrimitiveType<TAbiParameter>>
  : AbiParameterToPrimitiveType<TAbiParameter>

/**
 * @internal
 */
export type AbiEventTopicToPrimitiveType<
  TAbiParameter extends AbiParameter,
  TTopic extends LogTopic,
  TPrimitiveType = TAbiParameter['type'] extends HashedEventTypes
    ? TTopic
    : AbiParameterToPrimitiveType<TAbiParameter>,
> = DistributeLogTopicType<TPrimitiveType, TTopic>

// TODO
export type AbiEventParametersToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  TConfig extends EventParametersConfig = EventParametersDefaultConfig,
  TBase = TAbiParameters[0] extends { name: string } ? {} : [],
> = Prettify<
  TAbiParameters extends readonly [infer Head, ...infer Tail]
    ? Head extends { indexed: true }
      ? Head extends AbiParameter
        ? Head extends { name: infer Name extends string }
          ? MaybeRequired<
              { [_ in Name]?: AbiEventParameterToPrimitiveType<Head, TConfig> },
              TConfig['Required']
            > &
              (Tail extends readonly []
                ? {}
                : Tail extends readonly AbiParameter[]
                ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
                : {})
          : MaybeExcludeEmpty<
              | (TConfig['EnableUnion'] extends true
                  ? [AbiEventParameterToPrimitiveType<Head, TConfig>]
                  : [])
              | [
                  AbiEventParameterToPrimitiveType<Head, TConfig>,
                  ...(Tail extends readonly []
                    ? []
                    : Tail extends readonly AbiParameter[]
                    ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
                    : []),
                ],
              TConfig['Required']
            >
        : TBase
      : TConfig['IndexedOnly'] extends false
      ? Head extends AbiParameter
        ? Head extends { name: infer Name extends string }
          ? {
              [_ in Name]: AbiParameterToPrimitiveType<Head>
            } & (Tail extends readonly []
              ? {}
              : Tail extends readonly AbiParameter[]
              ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
              : {})
          : [
              AbiParameterToPrimitiveType<Head>,
              ...(Tail extends readonly []
                ? []
                : Tail extends readonly AbiParameter[]
                ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
                : []),
            ]
        : TBase
      : Tail extends readonly []
      ? TBase
      : Tail extends readonly AbiParameter[]
      ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
      : TBase
    : TBase
>

// TODO
type AbiEventTopicsToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  TTopics extends LogTopic[] | undefined = undefined,
  TData extends Hex | undefined = undefined,
  TBase = TAbiParameters[0] extends { name: string } ? {} : [],
> = Prettify<
  TAbiParameters extends readonly [infer Head, ...infer Tail]
    ? TTopics extends readonly [infer TopicHead, ...infer TopicTail]
      ? Head extends { indexed: true }
        ? Head extends AbiParameter
          ? Head extends { name: infer Name extends string }
            ? {
                [_ in Name]: TopicHead extends LogTopic
                  ? AbiEventTopicToPrimitiveType<Head, TopicHead>
                  : never
              } & (Tail extends readonly []
                ? {}
                : Tail extends readonly AbiParameter[]
                ? TopicTail extends LogTopic[]
                  ? AbiEventTopicsToPrimitiveTypes<Tail, TopicTail, TData>
                  : {}
                : {})
            : [
                TopicHead extends LogTopic
                  ? AbiEventTopicToPrimitiveType<Head, TopicHead>
                  : never,
                ...(Tail extends readonly []
                  ? []
                  : Tail extends readonly AbiParameter[]
                  ? TopicTail extends LogTopic[]
                    ? AbiEventTopicsToPrimitiveTypes<Tail, TopicTail, TData>
                    : []
                  : []),
              ]
          : TBase
        : TBase
      : TTopics extends readonly []
      ? TData extends '0x'
        ? TBase
        : TData extends Hex
        ? Head extends AbiParameter
          ? Head extends { indexed: true }
            ? Tail extends readonly AbiParameter[]
              ? AbiEventTopicsToPrimitiveTypes<Tail, [], TData>
              : TBase
            : Head extends { name: infer Name extends string }
            ? {
                [_ in Name]: AbiParameterToPrimitiveType<Head>
              } & (Tail extends readonly []
                ? {}
                : Tail extends readonly AbiParameter[]
                ? AbiEventTopicsToPrimitiveTypes<Tail, [], TData>
                : {})
            : [
                AbiParameterToPrimitiveType<Head>,
                ...(Tail extends readonly []
                  ? []
                  : Tail extends readonly AbiParameter[]
                  ? AbiEventTopicsToPrimitiveTypes<Tail, [], TData>
                  : []),
              ]
          : TBase
        : TBase
      : TBase
    : undefined
>
