import type {
  AbiParameter,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
} from 'abitype'

import {
  AbiDecodingDataSizeTooSmallError,
  type AbiDecodingDataSizeTooSmallErrorType,
  AbiDecodingZeroDataError,
  type AbiDecodingZeroDataErrorType,
  InvalidAbiDecodingTypeError,
  type InvalidAbiDecodingTypeErrorType,
} from '../../errors/abi.js'
import type { Hex } from '../../types/misc.js'
import {
  type ChecksumAddressErrorType,
  checksumAddress,
} from '../address/getAddress.js'
import { type SizeErrorType, size } from '../data/size.js'
import { type SliceErrorType, slice } from '../data/slice.js'
import { type TrimErrorType, trim } from '../data/trim.js'
import {
  type HexToBigIntErrorType,
  type HexToBoolErrorType,
  type HexToNumberErrorType,
  type HexToStringErrorType,
  hexToBigInt,
  hexToBool,
  hexToNumber,
  hexToString,
} from '../encoding/fromHex.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type GetArrayComponentsErrorType,
  getArrayComponents,
} from './encodeAbiParameters.js'

export type DecodeAbiParametersReturnType<
  TParams extends
    | readonly AbiParameter[]
    | readonly unknown[] = readonly AbiParameter[],
> = AbiParametersToPrimitiveTypes<
  TParams extends readonly AbiParameter[] ? TParams : AbiParameter[]
>

export type DecodeAbiParametersErrorType =
  | AbiDecodingDataSizeTooSmallErrorType
  | AbiDecodingZeroDataErrorType
  | DecodeParamsErrorType
  | SizeErrorType
  | ErrorType

export function decodeAbiParameters<
  const TParams extends readonly AbiParameter[] | readonly unknown[],
>(params: TParams, data: Hex): DecodeAbiParametersReturnType<TParams> {
  if (data === '0x' && (params as unknown[]).length > 0)
    throw new AbiDecodingZeroDataError()
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data,
      params: params as readonly AbiParameter[],
      size: size(data),
    })
  return decodeParams({
    data,
    params: params as readonly AbiParameter[],
  }) as unknown as DecodeAbiParametersReturnType<TParams>
}

////////////////////////////////////////////////////////////////////

type TupleAbiParameter = AbiParameter & { components: readonly AbiParameter[] }

type DecodeParamsErrorType = DecodeParamErrorType | SizeErrorType | ErrorType

function decodeParams<const TParams extends readonly AbiParameter[]>({
  data,
  params,
}: { data: Hex; params: TParams }) {
  const decodedValues: unknown[] = []
  let position = 0

  for (let i = 0; i < params.length; i++) {
    if (position >= size(data))
      throw new AbiDecodingDataSizeTooSmallError({
        data,
        params,
        size: size(data),
      })

    const param = params[i]
    const { consumed, value } = decodeParam({ data, param, position })
    decodedValues.push(value)
    // Step across the data by the amount of data consumed by this parameter.
    position += consumed
  }

  return decodedValues as unknown as AbiParametersToPrimitiveTypes<TParams>
}

type DecodeParamErrorType =
  | DecodeArrayErrorType
  | DecodeTupleErrorType
  | DecodeStringErrorType
  | DecodeBytesErrorType
  | DecodeNumberErrorType
  | DecodeAddressErrorType
  | DecodeBoolErrorType
  | InvalidAbiDecodingTypeErrorType
  | ErrorType

function decodeParam({
  data,
  param,
  position,
}: { data: Hex; param: AbiParameter; position: number }): {
  consumed: number
  value: any
} {
  const arrayComponents = getArrayComponents(param.type)
  if (arrayComponents) {
    const [length, type] = arrayComponents
    return decodeArray(data, {
      length,
      param: { ...param, type: type } as AbiParameter,
      position,
    })
  }
  if (param.type === 'tuple') {
    return decodeTuple(data, { param: param as TupleAbiParameter, position })
  }
  if (param.type === 'string') {
    return decodeString(data, { position })
  }
  if (param.type.startsWith('bytes')) {
    return decodeBytes(data, { param, position })
  }

  const value = slice(data, position, position + 32, { strict: true }) as Hex
  if (param.type.startsWith('uint') || param.type.startsWith('int')) {
    return decodeNumber(value, { param })
  }
  if (param.type === 'address') {
    return decodeAddress(value)
  }
  if (param.type === 'bool') {
    return decodeBool(value)
  }
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: '/docs/contract/decodeAbiParameters',
  })
}

////////////////////////////////////////////////////////////////////

type DecodeAddressErrorType =
  | ChecksumAddressErrorType
  | SliceErrorType
  | ErrorType

function decodeAddress(value: Hex) {
  return { consumed: 32, value: checksumAddress(slice(value, -20)) }
}

type DecodeArrayErrorType = HexToNumberErrorType | SliceErrorType | ErrorType

function decodeArray<const TParam extends AbiParameter>(
  data: Hex,
  {
    param,
    length,
    position,
  }: {
    param: TParam
    length: number | null
    position: number
  },
) {
  // If the length of the array is not known in advance (dynamic array),
  // we will need to decode the offset of the array data.
  if (!length) {
    // Get the offset of the array data.
    const offset = hexToNumber(
      slice(data, position, position + 32, { strict: true }),
    )
    // Get the length of the array from the offset.
    const length = hexToNumber(
      slice(data, offset, offset + 32, { strict: true }),
    )

    let consumed = 0
    const value: AbiParameterToPrimitiveType<TParam>[] = []
    for (let i = 0; i < length; ++i) {
      const decodedChild = decodeParam({
        data: slice(data, offset + 32),
        param,
        position: consumed,
      })
      consumed += decodedChild.consumed
      value.push(decodedChild.value)
    }
    return { value, consumed: 32 }
  }

  // If the length of the array is known in advance,
  // and the length of an element deeply nested in the array is not known,
  // we need to decode the offset of the array data.
  if (hasDynamicChild(param)) {
    // Get the child type of the array.
    const arrayComponents = getArrayComponents(param.type)
    // If the child type is not known, the array is dynamic.
    const dynamicChild = !arrayComponents?.[0]

    let consumed = 0
    const value: AbiParameterToPrimitiveType<TParam>[] = []
    for (let i = 0; i < length; ++i) {
      const offset = hexToNumber(
        slice(data, position, position + 32, { strict: true }),
      )
      const decodedChild = decodeParam({
        data: slice(data, offset),
        param,
        position: dynamicChild ? consumed : i * 32,
      })
      consumed += decodedChild.consumed
      value.push(decodedChild.value)
    }
    return { value, consumed: 32 }
  }

  // If the length of the array is known in advance,
  // and the length of each element in the array is known,
  // the array data is encoded contiguously after the array.
  let consumed = 0
  const value: AbiParameterToPrimitiveType<TParam>[] = []
  for (let i = 0; i < length; ++i) {
    const decodedChild = decodeParam({
      data,
      param,
      position: position + consumed,
    })
    consumed += decodedChild.consumed
    value.push(decodedChild.value)
  }
  return { value, consumed }
}

type DecodeBoolErrorType = HexToBoolErrorType | ErrorType

function decodeBool(value: Hex) {
  return { consumed: 32, value: hexToBool(value) }
}

type DecodeBytesErrorType = HexToNumberErrorType | SliceErrorType | ErrorType

function decodeBytes<const TParam extends AbiParameter>(
  data: Hex,
  { param, position }: { param: TParam; position: number },
) {
  const [_, size] = param.type.split('bytes')
  if (!size) {
    // If we don't have a size, we're dealing with a dynamic-size array
    // so we need to read the offset of the data part first.
    const offset = hexToNumber(
      slice(data, position, position + 32, { strict: true }),
    )
    const length = hexToNumber(
      slice(data, offset, offset + 32, { strict: true }),
    )
    // If there is no length, we have zero data.
    if (length === 0) return { consumed: 32, value: '0x' }
    const value = slice(data, offset + 32, offset + 32 + length, {
      strict: true,
    })
    return { consumed: 32, value }
  }

  const value = slice(data, position, position + parseInt(size), {
    strict: true,
  })
  return { consumed: 32, value }
}

type DecodeNumberErrorType =
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | ErrorType

function decodeNumber<const TParam extends AbiParameter>(
  value: Hex,
  { param }: { param: TParam },
) {
  const signed = param.type.startsWith('int')
  const size = parseInt(param.type.split('int')[1] || '256')
  return {
    consumed: 32,
    value:
      size > 48
        ? hexToBigInt(value, { signed })
        : hexToNumber(value, { signed }),
  }
}

type DecodeStringErrorType =
  | HexToNumberErrorType
  | HexToStringErrorType
  | SliceErrorType
  | TrimErrorType
  | ErrorType

function decodeString(data: Hex, { position }: { position: number }) {
  const offset = hexToNumber(
    slice(data, position, position + 32, { strict: true }),
  )
  const length = hexToNumber(slice(data, offset, offset + 32, { strict: true }))
  // If there is no length, we have zero data (empty string).
  if (length === 0) return { consumed: 32, value: '' }
  const value = hexToString(
    trim(slice(data, offset + 32, offset + 32 + length, { strict: true })),
  )
  return { consumed: 32, value }
}

type DecodeTupleErrorType =
  | HasDynamicChildErrorType
  | HexToNumberErrorType
  | SliceErrorType
  | ErrorType

function decodeTuple<
  const TParam extends AbiParameter & { components: readonly AbiParameter[] },
>(data: Hex, { param, position }: { param: TParam; position: number }) {
  // Tuples can have unnamed components (i.e. they are arrays), so we must
  // determine whether the tuple is named or unnamed. In the case of a named
  // tuple, the value will be an object where each property is the name of the
  // component. In the case of an unnamed tuple, the value will be an array.
  const hasUnnamedChild =
    param.components.length === 0 || param.components.some(({ name }) => !name)

  // Initialize the value to an object or an array, depending on whether the
  // tuple is named or unnamed.
  const value: any = hasUnnamedChild ? [] : {}
  let consumed = 0

  // If the tuple has a dynamic child, we must first decode the offset to the
  // tuple data.
  if (hasDynamicChild(param)) {
    const offset = hexToNumber(
      slice(data, position, position + 32, { strict: true }),
    )
    // Decode each component of the tuple, starting at the offset.
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i]
      const decodedChild = decodeParam({
        data: slice(data, offset),
        param: component,
        position: consumed,
      })
      consumed += decodedChild.consumed
      value[hasUnnamedChild ? i : component?.name!] = decodedChild.value
    }
    return { consumed: 32, value }
  }

  // If the tuple has static children, we can just decode each component
  // in sequence.
  for (let i = 0; i < param.components.length; ++i) {
    const component = param.components[i]
    const decodedChild = decodeParam({
      data,
      param: component,
      position: position + consumed,
    })
    consumed += decodedChild.consumed
    value[hasUnnamedChild ? i : component?.name!] = decodedChild.value
  }
  return { consumed, value }
}

type HasDynamicChildErrorType = GetArrayComponentsErrorType | ErrorType

function hasDynamicChild(param: AbiParameter) {
  const { type } = param
  if (type === 'string') return true
  if (type === 'bytes') return true
  if (type.endsWith('[]')) return true

  if (type === 'tuple') return (param as any).components?.some(hasDynamicChild)

  const arrayComponents = getArrayComponents(param.type)
  if (
    arrayComponents &&
    hasDynamicChild({ ...param, type: arrayComponents[1] } as AbiParameter)
  )
    return true

  return false
}
