import {
  AbiParameter,
  AbiParametersToPrimitiveTypes,
  AbiParameterToPrimitiveType,
} from 'abitype'

import { Hex } from '../../types'
import { BaseError } from '../BaseError'
import { concat, padHex, size } from '../data'
import { boolToHex, numberToHex, stringToHex } from '../encoding'

/**
 * @description Encodes a list of primitive values into an ABI-encoded hex value.
 */
export function encodeAbi<TParams extends readonly AbiParameter[]>({
  params,
  values,
}: {
  params: TParams
  values: AbiParametersToPrimitiveTypes<TParams>
}) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length,
    })
  // Prepare the parameters to determine dynamic types to encode.
  const preparedParams = prepareParams({ params, values })
  const data = encodeParams(preparedParams)
  if (data.length === 0) return undefined
  return data
}

/////////////////////////////////////////////////////////////////

type PreparedParam = { dynamic: boolean; encoded: Hex }

type TupleAbiParameter = AbiParameter & { components: readonly AbiParameter[] }
type Tuple = AbiParameterToPrimitiveType<TupleAbiParameter>

function prepareParams<TParams extends readonly AbiParameter[]>({
  params,
  values,
}: {
  params: TParams
  values: AbiParametersToPrimitiveTypes<TParams>
}) {
  let preparedParams: PreparedParam[] = []
  for (let i = 0; i < params.length; i++) {
    preparedParams.push(prepareParam({ param: params[i], value: values[i] }))
  }
  return preparedParams
}

function prepareParam<TParam extends AbiParameter>({
  param,
  value,
}: {
  param: TParam
  value: AbiParameterToPrimitiveType<TParam>
}): PreparedParam {
  const arrayComponents = getArrayComponents(param.type)
  if (arrayComponents) {
    const [length, type] = arrayComponents
    return encodeArray(value, { length, param: { ...param, type } })
  }
  if (param.type === 'tuple') {
    return encodeTuple(value as unknown as Tuple, {
      param: param as TupleAbiParameter,
    })
  }
  if (param.type === 'address') {
    return encodeAddress(value as unknown as Hex)
  }
  if (param.type === 'bool') {
    return encodeBool(value as unknown as boolean)
  }
  if (param.type.startsWith('uint') || param.type.startsWith('int')) {
    const signed = param.type.startsWith('int')
    return encodeNumber(value as unknown as number, { signed })
  }
  if (param.type.startsWith('bytes')) {
    return encodeBytes(value as unknown as Hex, { param })
  }
  if (param.type === 'string') {
    return encodeString(value as unknown as string)
  }
  throw new InvalidAbiEncodingTypeError(param.type)
}

/////////////////////////////////////////////////////////////////

function encodeParams(preparedParams: PreparedParam[]): Hex {
  // 1. Compute the size of the static part of the parameters.
  let staticSize = 0
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i]
    if (dynamic) staticSize += 32
    else staticSize += size(encoded)
  }

  // 2. Split the parameters into static and dynamic parts.
  let staticParams: Hex[] = []
  let dynamicParams: Hex[] = []
  let dynamicSize = 0
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i]
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }))
      dynamicParams.push(encoded)
      dynamicSize += size(encoded)
    } else {
      staticParams.push(encoded)
    }
  }

  // 3. Concatenate static and dynamic parts.
  return concat([...staticParams, ...dynamicParams])
}

/////////////////////////////////////////////////////////////////

function encodeAddress(value: Hex): PreparedParam {
  return { dynamic: false, encoded: padHex(value.toLowerCase() as Hex) }
}

function encodeArray<TParam extends AbiParameter>(
  value: AbiParameterToPrimitiveType<TParam>,
  {
    length,
    param,
  }: {
    length: number | null
    param: TParam
  },
): PreparedParam {
  let dynamic = length === null

  if (!Array.isArray(value)) throw new InvalidArrayError(value)
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length!,
      givenLength: value.length,
      type: `${param.type}[${length}]`,
    })

  let dynamicChild = false
  let preparedParams: PreparedParam[] = []
  for (let i = 0; i < value.length; i++) {
    const preparedParam = prepareParam({ param, value: value[i] })
    if (preparedParam.dynamic) dynamicChild = true
    preparedParams.push(preparedParam)
  }

  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams)
    if (dynamic) {
      const length = numberToHex(preparedParams.length, { size: 32 })
      return {
        dynamic: true,
        encoded: preparedParams.length > 0 ? concat([length, data]) : length,
      }
    }
    if (dynamicChild) return { dynamic: true, encoded: data }
  }
  return {
    dynamic: false,
    encoded: concat(preparedParams.map(({ encoded }) => encoded)),
  }
}

function encodeBytes<TParam extends AbiParameter>(
  value: Hex,
  { param }: { param: TParam },
): PreparedParam {
  const [_, size_] = param.type.split('bytes')
  if (!size_)
    return {
      dynamic: true,
      encoded: concat([
        padHex(numberToHex(size(value), { size: 32 })),
        padHex(value, { dir: 'right' }),
      ]),
    }
  return { dynamic: false, encoded: padHex(value, { dir: 'right' }) }
}

function encodeBool(value: boolean): PreparedParam {
  return { dynamic: false, encoded: padHex(boolToHex(value)) }
}

function encodeNumber(
  value: number,
  { signed }: { signed: boolean },
): PreparedParam {
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed,
    }),
  }
}

function encodeString(value: string): PreparedParam {
  return {
    dynamic: true,
    encoded: concat([
      padHex(numberToHex(value.length, { size: 32 })),
      padHex(stringToHex(value), { dir: 'right' }),
    ]),
  }
}

function encodeTuple<
  TParam extends AbiParameter & { components: readonly AbiParameter[] },
>(
  value: AbiParameterToPrimitiveType<TParam>,
  { param }: { param: TParam },
): PreparedParam {
  let dynamic = false
  let preparedParams: PreparedParam[] = []
  for (let i = 0; i < param.components.length; i++) {
    const param_ = param.components[i]
    const index = Array.isArray(value) ? i : param_.name
    const preparedParam = prepareParam({
      param: param_,
      value: (value as any)[index!] as any,
    })
    preparedParams.push(preparedParam)
    dynamic = preparedParam.dynamic
  }
  return {
    dynamic,
    encoded: dynamic
      ? encodeParams(preparedParams)
      : concat(preparedParams.map(({ encoded }) => encoded)),
  }
}

export function getArrayComponents(
  type: string,
): [length: number | null, innerType: string] | undefined {
  const matches = type.match(/^(.*)\[(\d+)?\]$/)
  return matches
    ? // Return `null` if the array is dynamic.
      [matches[2] ? Number(matches[2]) : null, matches[1]]
    : undefined
}

/////////////////////////////////////////////////////////////////
// Errors

export class AbiEncodingArrayLengthMismatchError extends BaseError {
  name = 'AbiEncodingArrayLengthMismatchError'
  constructor({
    expectedLength,
    givenLength,
    type,
  }: { expectedLength: number; givenLength: number; type: string }) {
    super(
      [
        `ABI encoding array length mismatch for type ${type}.`,
        `Expected length: ${expectedLength}`,
        `Given length: ${givenLength}`,
      ].join('\n'),
    )
  }
}

export class AbiEncodingLengthMismatchError extends BaseError {
  name = 'AbiEncodingLengthMismatchError'
  constructor({
    expectedLength,
    givenLength,
  }: { expectedLength: number; givenLength: number }) {
    super(
      [
        'ABI encoding params/values length mismatch.',
        `Expected length (params): ${expectedLength}`,
        `Given length (values): ${givenLength}`,
      ].join('\n'),
    )
  }
}

export class InvalidAbiEncodingTypeError extends BaseError {
  name = 'InvalidAbiEncodingType'
  constructor(type: string) {
    super(
      [
        `Type "${type}" is not a valid encoding type.`,
        'Please provide a valid ABI type.',
      ].join('\n'),
      { docsPath: '/docs/contract/encodeAbi#params' },
    )
  }
}

export class InvalidArrayError extends BaseError {
  name = 'InvalidArrayError'
  constructor(value: unknown) {
    super([`Value "${value}" is not a valid array.`].join('\n'))
  }
}
