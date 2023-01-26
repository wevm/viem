import {
  AbiParameter,
  AbiParametersToPrimitiveTypes,
  AbiParameterToPrimitiveType,
} from 'abitype'

import { Hex } from '../../types'
import { BaseError } from '../BaseError'
import { checksumAddress } from '../address'
import { size, slice, trim } from '../data'
import { hexToBigInt, hexToBool, hexToNumber, hexToString } from '../encoding'
import { getArrayComponents } from './encodeAbi'

export function decodeAbi<TParams extends readonly AbiParameter[]>({
  data,
  params,
}: { data: Hex; params: TParams }) {
  if (size(data) % 32 !== 0)
    throw new AbiDecodingDataSizeInvalidError(size(data))
  return decodeParams({
    data,
    params,
  })
}

////////////////////////////////////////////////////////////////////

type TupleAbiParameter = AbiParameter & { components: readonly AbiParameter[] }

function decodeParams<TParams extends readonly AbiParameter[]>({
  data,
  params,
}: {
  data: Hex
  params: TParams
}) {
  let decodedValues: unknown[] = []
  let position = 0

  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    const { consumed, value } = decodeParam({ data, param, position })
    decodedValues.push(value)
    position += consumed
  }

  return decodedValues as unknown as AbiParametersToPrimitiveTypes<TParams>
}

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

  let value = slice(data, position, position + 32) as Hex
  if (param.type.startsWith('uint') || param.type.startsWith('int')) {
    return decodeNumber(value, { param })
  }
  if (param.type === 'address') {
    return decodeAddress(value)
  }
  if (param.type === 'bool') {
    return decodeBool(value)
  }
  throw new InvalidAbiDecodingTypeError(param.type)
}

////////////////////////////////////////////////////////////////////

function decodeTuple<
  TParam extends AbiParameter & { components: readonly AbiParameter[] },
>(data: Hex, { param, position }: { param: TParam; position: number }) {
  const hasUnnamedChild =
    param.components.length === 0 || param.components.some(({ name }) => !name)

  let value: any = hasUnnamedChild ? [] : {}
  let consumed = 0

  if (hasDynamicChild(param)) {
    const offset = hexToNumber(slice(data, position, position + 32))
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

function decodeString(data: Hex, { position }: { position: number }) {
  const offset = hexToNumber(slice(data, position, position + 32))
  const length = hexToNumber(slice(data, offset, offset + 32))
  const value = hexToString(
    trim(slice(data, offset + 32, offset + 32 + length)),
  )
  return { consumed: 32, value }
}

function decodeBytes<TParam extends AbiParameter>(
  data: Hex,
  { param, position }: { param: TParam; position: number },
) {
  const [_, size] = param.type.split('bytes')
  if (!size) {
    const offset = hexToNumber(slice(data, position, position + 32))
    const length = hexToNumber(slice(data, offset, offset + 32))
    const value = slice(data, offset + 32, offset + 32 + length)
    return { consumed: 32, value }
  }

  const value = slice(data, position, position + parseInt(size))
  return { consumed: 32, value }
}

function decodeArray<TParam extends AbiParameter>(
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
  // dynamic array
  if (!length) {
    const offset = hexToNumber(slice(data, position, position + 32))
    const length = hexToNumber(slice(data, offset, offset + 32))

    let consumed = 0
    let value: AbiParameterToPrimitiveType<TParam>[] = []
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

  // fixed array w/ dynamic child
  if (hasDynamicChild(param)) {
    const arrayComponents = getArrayComponents(param.type)
    const dynamicChild = !arrayComponents?.[0]

    let consumed = 0
    let value: AbiParameterToPrimitiveType<TParam>[] = []
    for (let i = 0; i < length; ++i) {
      const offset = hexToNumber(slice(data, position, position + 32))
      const decodedChild = decodeParam({
        data: slice(data, offset),
        param,
        position: dynamicChild ? consumed : i * 32,
      })
      consumed += decodedChild.consumed
      value.push(decodedChild.value)
    }
    return { value, consumed }
  }

  let consumed = 0
  let value: AbiParameterToPrimitiveType<TParam>[] = []
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

function decodeAddress(value: Hex) {
  return { consumed: 32, value: checksumAddress(trim(value)) }
}

function decodeBool(value: Hex) {
  return { consumed: 32, value: hexToBool(value) }
}

function decodeNumber<TParam extends AbiParameter>(
  value: Hex,
  { param }: { param: TParam },
) {
  const signed = param.type.startsWith('int')
  const size = parseInt(param.type.split('int')[1] || '256')
  return {
    consumed: 32,
    value:
      // TODO: test this
      size > 48
        ? hexToBigInt(value, { signed })
        : hexToNumber(value, { signed }),
  }
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

/////////////////////////////////////////////////////////////////
// Errors

export class AbiDecodingDataSizeInvalidError extends BaseError {
  name = 'AbiDecodingDataSizeInvalidError'
  constructor(size: number) {
    super(
      [
        `Data size of ${size} bytes is invalid.`,
        'Size must be in increments of 32 bytes (size % 32 === 0).',
      ].join('\n'),
    )
  }
}

export class InvalidAbiDecodingTypeError extends BaseError {
  name = 'InvalidAbiDecodingType'
  constructor(type: string) {
    super(
      [
        `Type "${type}" is not a valid decoding type.`,
        'Please provide a valid ABI type.',
      ].join('\n'),
      { docsPath: '/docs/contract/decodeAbi#params' },
    )
  }
}
