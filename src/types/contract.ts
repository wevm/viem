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
import type {
  MaybeExcludeEmpty,
  MaybeRequired,
  NoUndefined,
  Prettify,
} from './utils'

type EventParametersConfig = {
  enableUnion: boolean
  indexedOnly: boolean
  required: boolean
}

type EventParametersDefaultConfig = {
  enableUnion: true
  indexedOnly: true
  required: false
}

//////////////////////////////////////////////////////////////////////
// ABIs

export type AbiItem = Abi[number]

export type EventDefinition = `${string}(${string})`

type HashedEventTypes = 'string' | 'bytes' | 'tuple' | `${string}[${string}]`

type EventTopicParam<
  TPrimitiveType = Hex,
  TTopic extends LogTopic = LogTopic,
> = NoUndefined<
  | (TTopic extends Hex ? TPrimitiveType : undefined)
  | (TTopic extends Hex[] ? TPrimitiveType[] : undefined)
  | (TTopic extends null ? null : undefined)
>

export type AbiEventParameterToPrimitiveType<
  TParam extends AbiParameter,
  TConfig extends EventParametersConfig = EventParametersDefaultConfig,
> = TConfig extends { enableUnion: true }
  ? EventTopicParam<AbiParameterToPrimitiveType<TParam>>
  : AbiParameterToPrimitiveType<TParam>

export type AbiEventParametersToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  TConfig extends EventParametersConfig = EventParametersDefaultConfig,
  TBase = TAbiParameters[0] extends { name: string } ? {} : [],
> = Prettify<
  TAbiParameters extends readonly [infer Head, ...infer Tail]
    ? Head extends { indexed: true }
      ? Head extends AbiParameter
        ? Head extends { name: infer Name }
          ? Name extends string
            ? MaybeRequired<
                {
                  [name in Name]?: AbiEventParameterToPrimitiveType<
                    Head,
                    TConfig
                  >
                },
                TConfig['required']
              > &
                (Tail extends readonly []
                  ? {}
                  : Tail extends readonly AbiParameter[]
                  ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
                  : {})
            : never
          : MaybeExcludeEmpty<
              | (TConfig extends { enableUnion: true }
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
              TConfig['required']
            >
        : TBase
      : TConfig extends { indexedOnly: false }
      ? Head extends AbiParameter
        ? Head extends { name: infer Name }
          ? Name extends string
            ? {
                [name in Name]: AbiParameterToPrimitiveType<Head>
              } & (Tail extends readonly []
                ? {}
                : Tail extends readonly AbiParameter[]
                ? AbiEventParametersToPrimitiveTypes<Tail, TConfig>
                : {})
            : never
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

export type AbiEventTopicToPrimitiveType<
  TParam extends AbiParameter,
  TTopic extends LogTopic,
  TPrimitiveType = TParam['type'] extends HashedEventTypes
    ? TTopic
    : AbiParameterToPrimitiveType<TParam>,
> = EventTopicParam<TPrimitiveType, TTopic>

export type AbiEventTopicsToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  TTopics extends LogTopic[] | undefined = undefined,
  TData extends Hex | undefined = undefined,
  TBase = TAbiParameters[0] extends { name: string } ? {} : [],
> = Prettify<
  TAbiParameters extends readonly [infer Head, ...infer Tail]
    ? TTopics extends readonly [infer TopicHead, ...infer TopicTail]
      ? Head extends { indexed: true }
        ? Head extends AbiParameter
          ? Head extends { name: infer Name }
            ? Name extends string
              ? {
                  [name in Name]: TopicHead extends LogTopic
                    ? AbiEventTopicToPrimitiveType<Head, TopicHead>
                    : never
                } & (Tail extends readonly []
                  ? {}
                  : Tail extends readonly AbiParameter[]
                  ? TopicTail extends LogTopic[]
                    ? AbiEventTopicsToPrimitiveTypes<Tail, TopicTail, TData>
                    : {}
                  : {})
              : never
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
            : Head extends { name: infer Name }
            ? Name extends string
              ? {
                  [name in Name]: AbiParameterToPrimitiveType<Head>
                } & (Tail extends readonly []
                  ? {}
                  : Tail extends readonly AbiParameter[]
                  ? AbiEventTopicsToPrimitiveTypes<Tail, [], TData>
                  : {})
              : never
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

export type ExtractArgsFromAbi<
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

export type ExtractConstructorArgsFromAbi<
  TAbi extends Abi | readonly unknown[],
  TAbiFunction extends AbiConstructor = TAbi extends Abi
    ? Extract<TAbi[number], { type: 'constructor' }>
    : AbiConstructor,
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

export type ExtractErrorArgsFromAbi<
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

export type ExtractEventArgsFromAbi<
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

export type ExtractEventArgsFromTopics<
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

export type ExtractErrorNameFromAbi<
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

export type ExtractEventNameFromAbi<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
> = TAbi extends Abi
  ? ExtractAbiEventNames<TAbi> extends infer AbiEventNames
    ? AbiEventNames | (TEventName extends AbiEventNames ? TEventName : never)
    : never
  : TEventName

export type ExtractFunctionNameFromAbi<
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

type ExtractNames<TAbi extends Abi> =
  | ExtractAbiFunctionNames<TAbi>
  | ExtractAbiEventNames<TAbi>
  | ExtractAbiErrorNames<TAbi>

export type ExtractNameFromAbi<
  TAbi extends Abi | readonly unknown[] = Abi,
  TName extends string = string,
> = TAbi extends Abi
  ? ExtractNames<TAbi> extends infer AbiNames
    ?
        | AbiNames
        | (TName extends AbiNames ? TName : never)
        | (Abi extends TAbi ? string : never)
    : never
  : TName

export type ExtractResultFromAbi<
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

export type MaybeAbiEventName<TAbiEvent extends AbiEvent | undefined> =
  TAbiEvent extends AbiEvent ? TAbiEvent['name'] : undefined

export type MaybeExtractEventArgsFromAbi<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = undefined,
> = TEventName extends string
  ? ExtractEventArgsFromAbi<TAbi, TEventName>
  : undefined

//////////////////////////////////////////////////////////////////////
// Args

export type ContractConfig<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability,
> = {
  /** Contract ABI */
  abi: Narrow<TAbi>
  /** Contract address */
  address: Address
  /** Function to invoke on the contract */
  functionName: ExtractFunctionNameFromAbi<
    TAbi,
    TFunctionName,
    TAbiStateMutability
  >
} & ExtractArgsFromAbi<TAbi, TFunctionName>

export type GetValue<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TValueType = TransactionRequest['value'],
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
> = TAbiFunction['stateMutability'] extends 'payable'
  ? { value?: TValueType }
  : TAbiFunction['payable'] extends true
  ? { value?: TValueType }
  : unknown
