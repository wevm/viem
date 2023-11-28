import type {
  TypedData,
  TypedDataDomain,
  TypedDataToPrimitiveTypes,
} from 'abitype'

export type TypedDataDefinition<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = {
  primaryType: GetTypedDataPrimaryType<TTypedData, TPrimaryType>
} & GetTypedDataMessage<TTypedData, TPrimaryType> &
  GetTypedDataTypes<TTypedData, TPrimaryType> &
  GetTypedDataDomain<TTypedData, TPrimaryType>

export type GetTypedDataDomain<
  TTypedData extends TypedData | { [key_1: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
  TSchema = TTypedData extends TypedData
    ? TypedDataToPrimitiveTypes<TTypedData>
    : { [key_2: string]: any },
  TDomain = TSchema extends { EIP712Domain: infer Domain }
    ? Domain
    : TypedDataDomain,
> = TPrimaryType extends 'EIP712Domain'
  ? {
      domain: TDomain
    }
  : {
      domain?: TDomain
    }

export type GetTypedDataMessage<
  TTypedData extends TypedData | { [key_1: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
  TSchema = TTypedData extends TypedData
    ? TypedDataToPrimitiveTypes<TTypedData>
    : { [key_2: string]: any },
  TMessage = TSchema[TPrimaryType extends keyof TSchema
    ? TPrimaryType
    : keyof TSchema],
> = TPrimaryType extends 'EIP712Domain'
  ? {}
  : { [key_3: string]: any } extends TMessage // Check if we were able to infer the shape of typed data
    ? {
        /**
         * Data to sign
         *
         * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link types} for type inference.
         */
        message: { [key_4: string]: unknown }
      }
    : {
        /** Data to sign */
        message: TMessage
      }

export type GetTypedDataPrimaryType<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TTypedData extends TypedData
  ? keyof TTypedData extends infer AbiFunctionNames
    ?
        | AbiFunctionNames
        | (TPrimaryType extends AbiFunctionNames ? TPrimaryType : never)
        | (TypedData extends TTypedData ? string : never)
        | 'EIP712Domain'
    : never
  : TPrimaryType

export type GetTypedDataTypes<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = TPrimaryType extends 'EIP712Domain'
  ? {
      types?: TTypedData
    }
  : {
      types: TTypedData
    }
