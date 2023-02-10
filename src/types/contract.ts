import type {
  Abi,
  AbiError,
  AbiEvent,
  AbiFunction,
  AbiType,
  AbiTypeToPrimitiveType,
  AbiParameter,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  AbiStateMutability,
  ExtractAbiFunction,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiError,
  ExtractAbiErrorNames,
  ExtractAbiFunctionNames,
  Narrow,
} from 'abitype'
import type { Address, Hex, LogTopic } from './misc'
import type { TransactionRequest } from './transaction'
import type { NoUndefined, Prettify, Trim } from './utils'

//////////////////////////////////////////////////////////////////////
// ABIs

export type AbiItem = Abi[number]

type HashedEventTypes = 'string' | 'bytes' | 'tuple' | `${string}[${string}]`

type EventTopicParam<
  TPrimitiveType = Hex,
  TTopic extends LogTopic = LogTopic,
> = NoUndefined<
  | (TTopic extends Hex ? TPrimitiveType : undefined)
  | (TTopic extends Hex[] ? TPrimitiveType[] : undefined)
  | (TTopic extends null ? null : undefined)
>

export type AbiEventParameterToPrimitiveType<TParam extends AbiParameter> =
  EventTopicParam<AbiParameterToPrimitiveType<TParam>>

export type AbiEventParametersToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  TBase = TAbiParameters[0] extends { name: string } ? {} : [],
> = Prettify<
  TAbiParameters extends readonly [infer Head, ...infer Tail]
    ? Head extends { indexed: true }
      ? Head extends AbiParameter
        ? Head extends { name: infer Name }
          ? Name extends string
            ? {
                [name in Name]?: AbiEventParameterToPrimitiveType<Head>
              } & (Tail extends readonly []
                ? {}
                : Tail extends readonly AbiParameter[]
                ? AbiEventParametersToPrimitiveTypes<Tail>
                : {})
            : never
          : [
              AbiEventParameterToPrimitiveType<Head>,
              ...(Tail extends readonly []
                ? []
                : Tail extends readonly AbiParameter[]
                ? AbiEventParametersToPrimitiveTypes<Tail>
                : []),
            ]
        : TBase
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
  TTopics extends LogTopic[] = LogTopic[],
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
                    ? AbiEventTopicsToPrimitiveTypes<Tail, TopicTail>
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
                    ? AbiEventTopicsToPrimitiveTypes<Tail, TopicTail>
                    : []
                  : []),
              ]
          : TBase
        : TBase
      : TBase
    : TBase
>

export type ExtractArgsFromAbi<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction & { type: 'function' } = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction & { type: 'function' },
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
  TAbiFunction extends AbiFunction & { type: 'constructor' } = TAbi extends Abi
    ? Extract<
        TAbi[number],
        {
          type: 'constructor'
        }
      >
    : AbiFunction & { type: 'constructor' },
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
  TAbiEvent extends AbiEvent & { type: 'event' } = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent & { type: 'event' },
  TArgs = AbiEventParametersToPrimitiveTypes<TAbiEvent['inputs']>,
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
      args?: TArgs
    }

export type ExtractEventArgsFromTopics<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TTopics extends LogTopic[],
  TAbiEvent extends AbiEvent & { type: 'event' } = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent & { type: 'event' },
  TArgs = AbiEventTopicsToPrimitiveTypes<TAbiEvent['inputs'], TTopics>,
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
  : TTopics extends readonly []
  ? { args?: never }
  : {
      args: TArgs
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
  TEventName extends string = string,
> = TAbi extends Abi
  ? ExtractAbiEventNames<TAbi> extends infer AbiEventNames
    ?
        | AbiEventNames
        | (TEventName extends AbiEventNames ? TEventName : never)
        | (Abi extends TAbi ? string : never)
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
  } = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction & { type: 'function' },
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

//////////////////////////////////////////////////////////////////////
// Event/Function Definitions

// REFACTOR: Remove below once we implement `ParseAbi`.
// https://github.com/wagmi-dev/viem/issues/29

export type EventDefinition = `${string}(${string})`

type ExtractArgsFromDefinitionConfig = {
  indexedOnly: unknown
}

type ExtractArgsFromDefinitionDefaultConfig = {
  indexedOnly: false
}

type NamedArg<
  TType extends string,
  TName extends string,
  TIndexed = false,
> = `${TType}${TIndexed extends true ? ' indexed ' : ' '}${TName}`
type UnnamedArg<TType extends string> = `${TType}`
type IndexedArg<TType extends string> = `${TType} indexed`

type ExtractTypeFromArg<
  TArg,
  TRest = unknown,
  TConfig extends ExtractArgsFromDefinitionConfig = ExtractArgsFromDefinitionDefaultConfig,
> = Trim<TArg> extends NamedArg<infer Type, infer Name, true>
  ? Type extends AbiType
    ? Name extends ''
      ? TRest extends [...args: any]
        ? [AbiTypeToPrimitiveType<Type>, ...TRest]
        : never
      : {
          [name in Trim<Name>]?:
            | AbiTypeToPrimitiveType<Type>
            | AbiTypeToPrimitiveType<Type>[]
        } & TRest
    : never
  : TConfig extends { indexedOnly: false }
  ? TArg extends NamedArg<infer Type, infer Name, false>
    ? Type extends AbiType
      ? Name extends 'indexed'
        ? TRest extends [...args: any]
          ? [AbiTypeToPrimitiveType<Type>, ...TRest]
          : never
        : { [name in Trim<Name>]: AbiTypeToPrimitiveType<Type> } & TRest
      : never
    : TArg extends UnnamedArg<infer Type>
    ? Type extends AbiType
      ? TRest extends [...args: any]
        ? [AbiTypeToPrimitiveType<Type>, ...TRest]
        : never
      : never
    : never
  : TArg extends NamedArg<infer Type, string, true>
  ? Type extends AbiType
    ? TRest extends [...args: any]
      ? [AbiTypeToPrimitiveType<Type>, ...TRest]
      : never
    : TRest
  : TArg extends IndexedArg<infer Type>
  ? Type extends AbiType
    ? TRest extends [...args: any]
      ?
          | [
              | AbiTypeToPrimitiveType<Type>
              | AbiTypeToPrimitiveType<Type>[]
              | null,
            ]
          | [
              (
                | AbiTypeToPrimitiveType<Type>
                | AbiTypeToPrimitiveType<Type>[]
                | null
              ),
              ...TRest,
            ]
      : never
    : TRest
  : TRest

type ExtractTypesFromArgs<
  TArgs,
  TConfig extends ExtractArgsFromDefinitionConfig = ExtractArgsFromDefinitionDefaultConfig,
> = Trim<TArgs> extends `${infer Head},${infer Tail}`
  ? ExtractTypeFromArg<Head, ExtractTypesFromArgs<Tail, TConfig>, TConfig>
  : ExtractTypeFromArg<
      Trim<TArgs>,
      Trim<TArgs> extends NamedArg<string, string>
        ? Trim<TArgs> extends IndexedArg<string>
          ? []
          : unknown
        : [],
      TConfig
    >

type ExtractArgsFromDefinition<
  TDef,
  TConfig extends ExtractArgsFromDefinitionConfig = ExtractArgsFromDefinitionDefaultConfig,
> = TDef extends `${string}(${infer Args})`
  ? ExtractTypesFromArgs<Args, TConfig>
  : 'Error: Invalid definition was provided.'

export type ExtractArgsFromEventDefinition<
  TDef,
  TConfig extends ExtractArgsFromDefinitionConfig = { indexedOnly: true },
> = ExtractArgsFromDefinition<TDef, TConfig> extends [...args: any]
  ? ExtractArgsFromDefinition<TDef, TConfig> | []
  : ExtractArgsFromDefinition<TDef, TConfig>

export type ExtractArgsFromFunctionDefinition<TDef> = ExtractArgsFromDefinition<
  TDef,
  { indexedOnly: false }
>

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
  TAbiFunction extends AbiFunction & { type: 'function' } = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction & { type: 'function' },
> = TAbiFunction['stateMutability'] extends 'payable'
  ? TValueType
  : TAbiFunction['payable'] extends true
  ? TValueType
  : never
