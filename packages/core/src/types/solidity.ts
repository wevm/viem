import type { AbiType, AbiTypeToPrimitiveType } from 'abitype'

import type { Trim } from './utils'

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
