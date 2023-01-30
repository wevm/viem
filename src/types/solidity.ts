import type {
  Abi,
  AbiFunction,
  AbiType,
  AbiTypeToPrimitiveType,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  AbiParameter,
  ExtractAbiEvent,
  AbiEvent,
  AbiError,
  ExtractAbiError,
} from 'abitype'

import type { Trim } from './utils'

//////////////////////////////////////////////////////////////////////
// ABIs

export type AbiEventParametersToPrimitiveTypes<
  TAbiParameters extends readonly AbiParameter[],
  TBase = TAbiParameters[0] extends { name: string } ? {} : [],
> = TAbiParameters extends readonly [infer Head, ...infer Tail]
  ? Head extends { indexed: true }
    ? Head extends AbiParameter
      ? Head extends { name: infer Name }
        ? Name extends string
          ? {
              [name in Name]?:
                | AbiParameterToPrimitiveType<Head>
                | AbiParameterToPrimitiveType<Head>[]
                | null
            } & (Tail extends readonly []
              ? {}
              : Tail extends readonly AbiParameter[]
              ? AbiEventParametersToPrimitiveTypes<Tail>
              : {})
          : never
        : [
            (
              | AbiParameterToPrimitiveType<Head>
              | AbiParameterToPrimitiveType<Head>[]
              | null
            ),
            ...(Tail extends readonly []
              ? []
              : Tail extends readonly AbiParameter[]
              ? AbiEventParametersToPrimitiveTypes<Tail>
              : []),
          ]
      : TBase
    : TBase
  : TBase

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

export type ExtractResultFromAbi<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction & { type: 'function' } = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction & { type: 'function' },
  TArgs = AbiParametersToPrimitiveTypes<TAbiFunction['outputs']>,
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
      result?: readonly unknown[]
    }
  : TArgs extends readonly []
  ? { result?: never }
  : {
      /** Arguments to pass contract method */ result: TArgs
    }

export type ExtractEventArgsFromAbi<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiEvent extends AbiEvent & { type: 'event' } = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TFunctionName>
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

//////////////////////////////////////////////////////////////////////
// Event/Function Definitions

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
