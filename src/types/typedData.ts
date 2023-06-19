import type {
  TypedData,
  TypedDataDomain,
  TypedDataToPrimitiveTypes,
} from 'abitype'

export type TypedDataDefinition<
  TTypedData extends TypedData | Record<string, unknown> =
    | TypedData
    | Record<string, unknown>,
  TPrimaryType extends keyof TTypedData | 'EIP712Domain' = keyof TTypedData,
> = GetTypedDataPrimaryType<TTypedData, TPrimaryType> &
  GetTypedDataMessage<TTypedData, TPrimaryType> &
  GetTypedDataTypes<TTypedData, TPrimaryType> &
  GetTypedDataDomain<TTypedData, TPrimaryType>

export type GetTypedDataDomain<
  TTypedData extends TypedData | Record<string, unknown>,
  TPrimaryType extends keyof TTypedData | 'EIP712Domain',
  ///
  Schema extends Record<string, unknown> = TTypedData extends TypedData
    ? TypedDataToPrimitiveTypes<TTypedData>
    : { [_: string]: any },
  TDomain = Schema extends { EIP712Domain: infer Domain }
    ? Domain
    : TypedDataDomain,
> = TPrimaryType extends 'EIP712Domain'
  ? { domain: TDomain }
  : { domain?: TDomain }

export type GetTypedDataMessage<
  TTypedData extends TypedData | Record<string, unknown>,
  TPrimaryType extends keyof TTypedData | 'EIP712Domain',
  ///
  Schema extends Record<string, unknown> = TTypedData extends TypedData
    ? TypedDataToPrimitiveTypes<TTypedData>
    : { [_: string]: any },
  Message extends Schema[keyof Schema] = Schema[TPrimaryType extends keyof Schema
    ? TPrimaryType
    : keyof Schema],
> = TPrimaryType extends 'EIP712Domain'
  ? {}
  : { [key: string]: any } extends Message // Check if we were able to infer the shape of typed data
  ? {
      /**
       * Data to sign
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link types} for type inference.
       */
      message: Record<string, unknown>
    }
  : {
      /** Data to sign */
      message: Message
    }

export type GetTypedDataPrimaryType<
  TTypedData extends TypedData | Record<string, unknown>,
  TPrimaryType extends keyof TTypedData,
> = {
  primaryType:
    | TPrimaryType // infer value
    | keyof TTypedData // show all values
    | 'EIP712Domain'
}

export type GetTypedDataTypes<
  TTypedData extends TypedData | Record<string, unknown>,
  TPrimaryType extends keyof TTypedData | 'EIP712Domain',
> = TPrimaryType extends 'EIP712Domain'
  ? { types?: TTypedData }
  : { types: TTypedData }
