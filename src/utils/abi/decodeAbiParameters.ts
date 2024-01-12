import type { AbiParameter, AbiParametersToPrimitiveTypes } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'

import {
  AbiDecodingDataSizeTooSmallError,
  AbiDecodingZeroDataError,
  InvalidAbiDecodingTypeError,
} from '../../errors/abi.js'
import type { ErrorType } from '../../errors/utils.js'
import { checksumAddress } from '../address/getAddress.js'
import { type Cursor, createCursor } from '../cursor.js'
import { size } from '../data/size.js'
import { sliceBytes } from '../data/slice.js'
import {
  bytesToBigInt,
  bytesToBool,
  bytesToNumber,
  bytesToString,
} from '../encoding/fromBytes.js'
import { hexToBytes } from '../encoding/toBytes.js'
import { bytesToHex } from '../encoding/toHex.js'
import { trim } from '../index.js'
import { getArrayComponents } from './encodeAbiParameters.js'

export type DecodeAbiParametersReturnType<
  TParams extends readonly AbiParameter[] = readonly AbiParameter[],
> = AbiParametersToPrimitiveTypes<
  TParams extends readonly AbiParameter[] ? TParams : AbiParameter[]
>

export type DecodeAbiParametersErrorType = ErrorType

export function decodeAbiParameters<
  const TParams extends readonly AbiParameter[],
>(
  params: TParams,
  data: ByteArray | Hex,
): DecodeAbiParametersReturnType<TParams> {
  const bytes = typeof data === 'string' ? hexToBytes(data) : data
  const cursor = createCursor(bytes)

  if (size(bytes) === 0 && params.length > 0)
    throw new AbiDecodingZeroDataError()
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data: typeof data === 'string' ? data : bytesToHex(data),
      params: params as readonly AbiParameter[],
      size: size(data),
    })

  let consumed = 0
  const values = []
  for (let i = 0; i < params.length; ++i) {
    const param = params[i]
    cursor.setPosition(consumed)
    const [data, consumed_] = decodeParameter(cursor, param, { refPosition: 0 })
    consumed += consumed_
    values.push(data)
  }
  return values as DecodeAbiParametersReturnType<TParams>
}

function decodeParameter(
  cursor: Cursor,
  param: AbiParameter,
  { refPosition }: { refPosition: number },
) {
  const arrayComponents = getArrayComponents(param.type)
  if (arrayComponents) {
    const [length, type] = arrayComponents
    return decodeArray(cursor, { ...param, type }, { length, refPosition })
  }
  if (param.type === 'tuple')
    return decodeTuple(cursor, param as TupleAbiParameter, { refPosition })

  if (param.type === 'address') return decodeAddress(cursor)
  if (param.type === 'bool') return decodeBool(cursor)
  if (param.type.startsWith('bytes'))
    return decodeBytes(cursor, param, { refPosition })
  if (param.type.startsWith('uint') || param.type.startsWith('int'))
    return decodeNumber(cursor, param)
  if (param.type === 'string') return decodeString(cursor, { refPosition })
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: '/docs/contract/decodeAbiParameters',
  })
}

////////////////////////////////////////////////////////////////////
// Type Decoders

const sizeOfLength = 32
const sizeOfOffset = 32

function decodeAddress(cursor: Cursor) {
  const value = cursor.readBytes(32)
  return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32]
}

function decodeArray(
  cursor: Cursor,
  param: AbiParameter,
  { length, refPosition }: { length: number | null; refPosition: number },
) {
  // If the length of the array is not known in advance (dynamic array),
  // this means we will need to wonder off to the pointer and decode.
  if (!length) {
    // Dealing with a dynamic type, so get the offset of the array data.
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset))

    // Start is the position of current slot + offset.
    const start = refPosition + offset
    const startOfData = start + sizeOfLength

    // Get the length of the array from the offset.
    cursor.setPosition(start)
    const length = bytesToNumber(cursor.readBytes(sizeOfLength))

    // Check if the array has any dynamic children.
    const dynamicChild = hasDynamicChild(param)

    let consumed = 0
    const value: unknown[] = []
    for (let i = 0; i < length; ++i) {
      // If any of the children is dynamic, then all elements will be offset pointer, thus size of one slot (32 bytes).
      // Otherwise, elements will be the size of their encoding (consumed bytes).
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed))
      const [data, consumed_] = decodeParameter(cursor, param, {
        refPosition: startOfData,
      })
      consumed += consumed_
      value.push(data)
    }

    // As we have gone wondering, set position back to the original position + next slot.
    cursor.setPosition(refPosition + 32)
    return [value, 32]
  }

  // If the length of the array is known in advance,
  // and the length of an element deeply nested in the array is not known,
  // we need to decode the offset of the array data.
  if (hasDynamicChild(param)) {
    // Dealing with dynamic types, so get the offset of the array data.
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset))

    // Start is the position of current slot + offset.
    const start = refPosition + offset

    const value: unknown[] = []
    for (let i = 0; i < length; ++i) {
      // Move cursor along to the next slot (next offset pointer).
      cursor.setPosition(start + i * 32)
      const [data] = decodeParameter(cursor, param, {
        refPosition: start,
      })
      value.push(data)
    }

    // As we have gone wondering, set position back to the original position + next slot.
    cursor.setPosition(refPosition + 32)
    return [value, 32]
  }

  // If the length of the array is known in advance and the array is deeply static,
  // then we can just decode each element in sequence.
  let consumed = 0
  const value: unknown[] = []
  for (let i = 0; i < length; ++i) {
    const [data, consumed_] = decodeParameter(cursor, param, {
      refPosition: refPosition + consumed,
    })
    consumed += consumed_
    value.push(data)
  }
  return [value, consumed]
}

function decodeBool(cursor: Cursor) {
  return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32]
}

function decodeBytes(
  cursor: Cursor,
  param: AbiParameter,
  { refPosition }: { refPosition: number },
) {
  const [_, size] = param.type.split('bytes')
  if (!size) {
    // Dealing with dynamic types, so get the offset of the bytes data.
    const offset = bytesToNumber(cursor.readBytes(32))

    // Set position of the cursor to start of bytes data.
    cursor.setPosition(refPosition + offset)

    const length = bytesToNumber(cursor.readBytes(32))

    // If there is no length, we have zero data.
    if (length === 0) {
      // As we have gone wondering, set position back to the original position + next slot.
      cursor.setPosition(refPosition + 32)
      return ['0x', 32]
    }

    const data = cursor.readBytes(length)

    // As we have gone wondering, set position back to the original position + next slot.
    cursor.setPosition(refPosition + 32)
    return [bytesToHex(data), 32]
  }

  const value = bytesToHex(cursor.readBytes(parseInt(size), 32))
  return [value, 32]
}

function decodeNumber(cursor: Cursor, param: AbiParameter) {
  const signed = param.type.startsWith('int')
  const size = parseInt(param.type.split('int')[1] || '256')
  const value = cursor.readBytes(32)
  return [
    size > 48
      ? bytesToBigInt(value, { signed })
      : bytesToNumber(value, { signed }),
    32,
  ]
}

type TupleAbiParameter = AbiParameter & { components: readonly AbiParameter[] }

function decodeTuple(
  cursor: Cursor,
  param: TupleAbiParameter,
  { refPosition }: { refPosition: number },
) {
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
    // Dealing with dynamic types, so get the offset of the tuple data.
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset))

    // Start is the position of referencing slot + offset.
    const start = refPosition + offset

    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i]
      cursor.setPosition(start + consumed)
      const [data, consumed_] = decodeParameter(cursor, component, {
        refPosition: start,
      })
      consumed += consumed_
      value[hasUnnamedChild ? i : component?.name!] = data
    }

    // As we have gone wondering, set position back to the original position + next slot.
    cursor.setPosition(refPosition + 32)
    return [value, 32]
  }

  // If the tuple has static children, we can just decode each component
  // in sequence.
  for (let i = 0; i < param.components.length; ++i) {
    const component = param.components[i]
    const [data, consumed_] = decodeParameter(cursor, component, {
      refPosition,
    })
    value[hasUnnamedChild ? i : component?.name!] = data
    consumed += consumed_
  }
  return [value, consumed]
}

function decodeString(
  cursor: Cursor,
  { refPosition }: { refPosition: number },
) {
  // Get offset to start of string data.
  const offset = bytesToNumber(cursor.readBytes(32))

  // Start is the position of current slot + offset.
  const start = refPosition + offset
  cursor.setPosition(start)

  const length = bytesToNumber(cursor.readBytes(32))

  // If there is no length, we have zero data (empty string).
  if (length === 0) {
    cursor.setPosition(refPosition + 32)
    return ['', 32]
  }

  const data = cursor.readBytes(length, 32)
  const value = bytesToString(trim(data))

  // As we have gone wondering, set position back to the original position + next slot.
  cursor.setPosition(refPosition + 32)

  return [value, 32]
}

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
