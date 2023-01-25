import {
  AbiParameter,
  AbiParametersToPrimitiveTypes,
  AbiParameterToPrimitiveType,
  AbiType,
} from 'abitype'

import { Hex } from '../../types'
import { checksumAddress } from '../address'
import { slice, trim } from '../data'
import { hexToBigInt, hexToNumber } from '../encoding'
import { getArrayComponents } from './encodeAbi'

export function decodeAbi<TParams extends readonly AbiParameter[]>({
  data,
  params,
}: { data: Hex; params: TParams }) {
  if (data.length % 2 !== 0) throw new Error('Invalid hex string')
  return decodeParams({
    data,
    params,
  })
}

////////////////////////////////////////////////////////////////////

export function decodeParams<TParams extends readonly AbiParameter[]>({
  data,
  params,
}: {
  data: Hex
  params: TParams
}) {
  let decodedValues: any[] = []
  let position = 0

  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    const { consumed, value } = decodeParam({ data, param, position })
    decodedValues.push(value)
    position += consumed
  }

  return decodedValues as unknown as AbiParametersToPrimitiveTypes<TParams>
}

export function decodeParam({
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
    return decodeArray(data, { length, param: { ...param, type }, position })
  }
  let value = slice(data, position, position + 32)
  if (param.type.startsWith('uint') || param.type.startsWith('int')) {
    return decodeNumber(value as unknown as Hex, {
      param,
    })
  }
  if (param.type === 'address') {
    return decodeAddress(value as unknown as Hex)
  }
  throw new Error('TODO')
}

////////////////////////////////////////////////////////////////////

export function decodeArray<TParam extends AbiParameter>(
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
    const offset = hexToNumber(slice(data, position, position + 32))

    let consumed = 0
    let value: AbiParameterToPrimitiveType<TParam>[] = []
    for (let i = 0; i < length; ++i) {
      const decodedChild = decodeParam({
        data: slice(data, offset),
        param,
        position: consumed,
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

export function hasDynamicChild(param: AbiParameter) {
  const { type } = param
  if (type === 'string') return true
  if (type === 'bytes') return true
  if (type.endsWith('[]')) return true

  const arrayComponents = getArrayComponents(param.type)
  if (
    arrayComponents &&
    hasDynamicChild({ ...param, type: arrayComponents[1] as AbiType })
  )
    return true

  if (type === 'tuple') return (param as any).components?.some(hasDynamicChild)

  return false
}
