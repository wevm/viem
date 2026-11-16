import type {
  AbiParameter,
  AbiParameterKind,
  AbiParametersToPrimitiveTypes,
  AbiParameterToPrimitiveType,
} from 'abitype'

import {
  AbiEncodingArrayLengthMismatchError,
  type AbiEncodingArrayLengthMismatchErrorType,
  AbiEncodingBytesSizeMismatchError,
  type AbiEncodingBytesSizeMismatchErrorType,
  AbiEncodingLengthMismatchError,
  type AbiEncodingLengthMismatchErrorType,
  InvalidAbiEncodingTypeError,
  type InvalidAbiEncodingTypeErrorType,
  InvalidArrayError,
  type InvalidArrayErrorType,
} from '../../errors/abi.js'
import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../../errors/address.js'
import { BaseError } from '../../errors/base.js'
import { IntegerOutOfRangeError } from '../../errors/encoding.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import { type PadHexErrorType, padHex } from '../data/pad.js'
import { type SizeErrorType, size } from '../data/size.js'
import { type SliceErrorType, slice } from '../data/slice.js'
import {
  type BoolToHexErrorType,
  boolToHex,
  type NumberToHexErrorType,
  numberToHex,
  type StringToHexErrorType,
  stringToHex,
} from '../encoding/toHex.js'
import { bytesRegex, integerRegex } from '../regex.js'

export type EncodeAbiParametersReturnType = Hex

export type EncodeAbiParametersErrorType =
  | AbiEncodingLengthMismatchErrorType
  | PrepareParamsErrorType
  | EncodeParamsErrorType
  | ErrorType

/**
 * @description Encodes a list of primitive values into an ABI-encoded hex value.
 *
 * - Docs: https://viem.sh/docs/abi/encodeAbiParameters#encodeabiparameters
 *
 *   Generates ABI encoded data using the [ABI specification](https://docs.soliditylang.org/en/latest/abi-spec), given a set of ABI parameters (inputs/outputs) and their corresponding values.
 *
 * @param params - a set of ABI Parameters (params), that can be in the shape of the inputs or outputs attribute of an ABI Item.
 * @param values - a set of values (values) that correspond to the given params.
 * @example
 * ```typescript
 * import { encodeAbiParameters } from 'viem'
 *
 * const encodedData = encodeAbiParameters(
 *   [
 *     { name: 'x', type: 'string' },
 *     { name: 'y', type: 'uint' },
 *     { name: 'z', type: 'bool' }
 *   ],
 *   ['wagmi', 420n, true]
 * )
 * ```
 *
 * You can also pass in Human Readable parameters with the parseAbiParameters utility.
 *
 * @example
 * ```typescript
 * import { encodeAbiParameters, parseAbiParameters } from 'viem'
 *
 * const encodedData = encodeAbiParameters(
 *   parseAbiParameters('string x, uint y, bool z'),
 *   ['wagmi', 420n, true]
 * )
 * ```
 */
export function encodeAbiParameters<
  const params extends readonly AbiParameter[] | readonly unknown[],
>(
  params: params,
  values: params extends readonly AbiParameter[]
    ? AbiParametersToPrimitiveTypes<params, AbiParameterKind, true>
    : never,
): EncodeAbiParametersReturnType {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length as number,
      givenLength: values.length as any,
    })
  const compiled: CompiledParam[] = new Array(params.length)
  const parts: string[] = new Array(params.length)
  for (let i = 0; i < params.length; i++) {
    compiled[i] = compile((params as readonly AbiParameter[])[i]!)
    parts[i] = encode(compiled[i]!, (values as readonly unknown[])[i])
  }
  // `join` flattens the string built with `+=`, so callers retain one flat
  // string instead of a tree of small parts.
  return ['0x', encodeParts(compiled, parts)].join('') as Hex
}

/////////////////////////////////////////////////////////////////

/**
 * A parameter parsed once per call. Values the fast path does not handle are
 * delegated to {@link prepareParam} so output and errors stay the same.
 */
type CompiledParam = {
  /** Element type of an array. */
  child: CompiledParam | undefined
  /** Components of a tuple. */
  components: readonly CompiledParam[] | undefined
  dynamic: boolean
  kind:
    | 'address'
    | 'array'
    | 'bool'
    | 'bytes'
    | 'number'
    | 'other'
    | 'string'
    | 'tuple'
  /** Length of a fixed array, or `null` for a dynamic array. */
  length: number | null
  max: bigint
  min: bigint
  param: AbiParameter
  signed: boolean
  /** Bits of an integer, or bytes of a `bytesN` (`0` for `bytes`). */
  size: number
}

const zeros = '0'.repeat(64)

/** Integer bounds by signedness and bit size (at most 64 entries). */
const integerBounds = new Map<string, readonly [min: bigint, max: bigint]>()

function compile(param: AbiParameter): CompiledParam {
  const compiled: CompiledParam = {
    child: undefined,
    components: undefined,
    dynamic: false,
    kind: 'other',
    length: null,
    max: 0n,
    min: 0n,
    param,
    signed: false,
    size: 0,
  }
  // Malformed parameters are left to `prepareParam`, which throws when it
  // reaches them.
  if (typeof param !== 'object' || param === null) return compiled
  const { type } = param
  if (typeof type !== 'string') return compiled

  const arrayComponents = getArrayComponents(type)
  if (arrayComponents) {
    const [length, innerType] = arrayComponents
    const child = compile({ ...param, type: innerType })
    compiled.kind = 'array'
    compiled.length = length
    compiled.child = child
    compiled.dynamic = length === null || child.dynamic
    return compiled
  }
  if (type === 'tuple') {
    const { components } = param as Partial<TupleAbiParameter>
    if (!Array.isArray(components)) return compiled
    compiled.kind = 'tuple'
    // `Array.from` visits holes, which `prepareParam` rejects.
    compiled.components = Array.from(components, (component) =>
      compile(component),
    )
    compiled.dynamic = compiled.components.some(({ dynamic }) => dynamic)
    return compiled
  }
  if (type === 'address') compiled.kind = 'address'
  else if (type === 'bool') compiled.kind = 'bool'
  else if (type.startsWith('uint') || type.startsWith('int')) {
    const signed = type.startsWith('int')
    const [, , size = '256'] = integerRegex.exec(type) ?? []
    const key = signed ? `i${size}` : size
    let bounds = integerBounds.get(key)
    if (!bounds) {
      const max = 2n ** (BigInt(size) - (signed ? 1n : 0n)) - 1n
      bounds = [signed ? -max - 1n : 0n, max]
      integerBounds.set(key, bounds)
    }
    compiled.kind = 'number'
    compiled.signed = signed
    compiled.size = Number(size)
    compiled.min = bounds[0]
    compiled.max = bounds[1]
  } else if (type === 'bytes') {
    compiled.kind = 'bytes'
    compiled.dynamic = true
  } else if (bytesRegex.test(type)) {
    compiled.kind = 'bytes'
    compiled.size = Number(type.slice(5))
  } else if (type.startsWith('bytes'))
    compiled.dynamic = !type.split('bytes')[1]
  else if (type === 'string') {
    compiled.kind = 'string'
    compiled.dynamic = true
  }
  return compiled
}

/** Encodes a value as un-prefixed hex. */
function encode(compiled: CompiledParam, value: unknown): string {
  switch (compiled.kind) {
    case 'address':
      if (typeof value === 'string' && isAddress(value))
        return `000000000000000000000000${value.slice(2).toLowerCase()}`
      break
    case 'array':
      return encodeArrayValue(compiled, value)
    case 'bool':
      if (typeof value === 'boolean')
        return value ? `${zeros.slice(1)}1` : zeros
      break
    case 'bytes':
      if (
        typeof value === 'string' &&
        value.length % 2 === 0 &&
        value.startsWith('0x') &&
        value.indexOf('0x', 2) === -1
      ) {
        const data = value.slice(2)
        const size = data.length / 2
        if (compiled.size === 0)
          return word(size) + data.padEnd(Math.ceil(size / 32) * 64, '0')
        if (size === compiled.size) return data.padEnd(64, '0')
      }
      break
    case 'number':
      if (
        typeof value === 'bigint' ||
        (typeof value === 'number' && Number.isSafeInteger(value))
      ) {
        const { max, min, signed, size } = compiled
        if (value > max || value < min)
          throw new IntegerOutOfRangeError({
            max: max.toString(),
            min: min.toString(),
            signed,
            size: size / 8,
            value: value.toString(),
          })
        const hex = (value < 0 ? (1n << 256n) + BigInt(value) : value).toString(
          16,
        )
        return zeros.slice(hex.length) + hex
      }
      break
    case 'string':
      if (typeof value === 'string') {
        const data = stringToHex(value).slice(2)
        const remainder = data.length % 64
        return (
          word(data.length / 2) +
          data +
          (remainder ? zeros.slice(remainder) : '')
        )
      }
      break
    case 'tuple':
      return encodeTupleValue(compiled, value)
  }
  return prepareParam({
    param: compiled.param,
    value: value as never,
  }).encoded.slice(2)
}

function encodeArrayValue(compiled: CompiledParam, value: unknown): string {
  const { length } = compiled
  const child = compiled.child!
  if (!Array.isArray(value)) throw new InvalidArrayError(value)
  if (length !== null && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${child.param.type}[${length}]`,
    })

  // Zero-length fixed arrays of dynamic types (e.g. `string[0]`) are dynamic
  // per the ABI spec, even though they have no elements to inspect.
  const dynamicChild =
    value.length === 0 ? isDynamicType(child.param) : child.dynamic
  let data = ''
  if (dynamicChild) {
    let head = ''
    let offset = value.length * 32
    for (let i = 0; i < value.length; i++) {
      const part = encode(child, value[i])
      head += word(offset)
      data += part
      offset += Math.ceil(part.length / 2)
    }
    data = head + data
  } else for (let i = 0; i < value.length; i++) data += encode(child, value[i])

  if (length === null) return word(value.length) + data
  return data
}

function encodeTupleValue(compiled: CompiledParam, value: unknown): string {
  const components = compiled.components!
  const isArray = Array.isArray(value)
  const parts: string[] = new Array(components.length)
  for (let i = 0; i < components.length; i++) {
    const component = components[i]!
    parts[i] = encode(
      component,
      (value as any)[isArray ? i : component.param.name!],
    )
  }
  if (compiled.dynamic) return encodeParts(components, parts)
  let data = ''
  for (let i = 0; i < parts.length; i++) data += parts[i]
  return data
}

/** Lays out encoded parts as static heads followed by dynamic tails. */
function encodeParts(
  compiled: readonly CompiledParam[],
  parts: readonly string[],
): string {
  let offset = 0
  for (let i = 0; i < parts.length; i++)
    offset += compiled[i]!.dynamic ? 32 : Math.ceil(parts[i]!.length / 2)
  let head = ''
  let tail = ''
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (compiled[i]!.dynamic) {
      head += word(offset)
      tail += part
      offset += Math.ceil(part.length / 2)
    } else head += part
  }
  return head + tail
}

/** Encodes a non-negative integer as a 32-byte word. */
function word(value: number): string {
  const hex = value.toString(16)
  return zeros.slice(hex.length) + hex
}

/////////////////////////////////////////////////////////////////

type PreparedParam = { dynamic: boolean; encoded: Hex }

type TupleAbiParameter = AbiParameter & { components: readonly AbiParameter[] }
type Tuple = AbiParameterToPrimitiveType<TupleAbiParameter>

type PrepareParamsErrorType = PrepareParamErrorType | ErrorType

type PrepareParamErrorType =
  | EncodeAddressErrorType
  | EncodeArrayErrorType
  | EncodeBytesErrorType
  | EncodeBoolErrorType
  | EncodeNumberErrorType
  | EncodeStringErrorType
  | EncodeTupleErrorType
  | GetArrayComponentsErrorType
  | InvalidAbiEncodingTypeErrorType
  | ErrorType

function prepareParam<const param extends AbiParameter>({
  param,
  value,
}: {
  param: param
  value: AbiParameterToPrimitiveType<param>
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
    const [, , size = '256'] = integerRegex.exec(param.type) ?? []
    return encodeNumber(value as unknown as number, {
      signed,
      size: Number(size),
    })
  }
  if (param.type.startsWith('bytes')) {
    return encodeBytes(value as unknown as Hex, { param })
  }
  if (param.type === 'string') {
    return encodeString(value as unknown as string)
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: '/docs/contract/encodeAbiParameters',
  })
}

/////////////////////////////////////////////////////////////////

type EncodeParamsErrorType = NumberToHexErrorType | SizeErrorType | ErrorType

function encodeParams(preparedParams: PreparedParam[]): Hex {
  // 1. Compute the size of the static part of the parameters.
  let staticSize = 0
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i]
    if (dynamic) staticSize += 32
    else staticSize += size(encoded)
  }

  // 2. Split the parameters into static and dynamic parts.
  const staticParams: Hex[] = []
  const dynamicParams: Hex[] = []
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
  // `concatHex` returns `'0x'` for empty input (zero-width parameters).
  return concatHex([...staticParams, ...dynamicParams])
}

/////////////////////////////////////////////////////////////////

type EncodeAddressErrorType =
  | InvalidAddressErrorType
  | IsAddressErrorType
  | ErrorType

function encodeAddress(value: Hex): PreparedParam {
  if (!isAddress(value)) throw new InvalidAddressError({ address: value })
  return { dynamic: false, encoded: padHex(value.toLowerCase() as Hex) }
}

type EncodeArrayErrorType =
  | AbiEncodingArrayLengthMismatchErrorType
  | ConcatHexErrorType
  | EncodeParamsErrorType
  | InvalidArrayErrorType
  | NumberToHexErrorType
  // TODO: Add back once circular type reference is resolved
  // | PrepareParamErrorType
  | ErrorType

function encodeArray<const param extends AbiParameter>(
  value: AbiParameterToPrimitiveType<param>,
  {
    length,
    param,
  }: {
    length: number | null
    param: param
  },
): PreparedParam {
  const dynamic = length === null

  if (!Array.isArray(value)) throw new InvalidArrayError(value)
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length!,
      givenLength: value.length,
      type: `${param.type}[${length}]`,
    })

  // Zero-length fixed arrays of dynamic types (e.g. `string[0]`) are dynamic
  // per the ABI spec, even though they have no elements to inspect.
  let dynamicChild = value.length === 0 && isDynamicType(param)
  const preparedParams: PreparedParam[] = []
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
        encoded: concatHex([length, data]),
      }
    }
    if (dynamicChild) return { dynamic: true, encoded: data }
  }
  return {
    dynamic: false,
    encoded: concatHex(preparedParams.map(({ encoded }) => encoded)),
  }
}

type EncodeBytesErrorType =
  | AbiEncodingBytesSizeMismatchErrorType
  | ConcatHexErrorType
  | PadHexErrorType
  | NumberToHexErrorType
  | SizeErrorType
  | ErrorType

function encodeBytes<const param extends AbiParameter>(
  value: Hex,
  { param }: { param: param },
): PreparedParam {
  const [, paramSize] = param.type.split('bytes')
  // Odd-length hex is left-padded to whole bytes, matching `hexToBytes`.
  const hex: Hex = value.length % 2 ? `0x0${value.slice(2)}` : value
  const bytesSize = size(hex)
  if (!paramSize) {
    let value_ = hex
    // If the size is not divisible by 32 bytes, pad the end
    // with empty bytes to the ceiling 32 bytes.
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: 'right',
        size: Math.ceil(bytesSize / 32) * 32,
      })
    return {
      dynamic: true,
      encoded: concatHex([
        padHex(numberToHex(bytesSize, { size: 32 })),
        value_,
      ]),
    }
  }
  if (bytesSize !== Number.parseInt(paramSize, 10))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize, 10),
      value,
    })
  return { dynamic: false, encoded: padHex(hex, { dir: 'right' }) }
}

type EncodeBoolErrorType = PadHexErrorType | BoolToHexErrorType | ErrorType

function encodeBool(value: boolean): PreparedParam {
  if (typeof value !== 'boolean')
    throw new BaseError(
      `Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`,
    )
  return { dynamic: false, encoded: padHex(boolToHex(value)) }
}

type EncodeNumberErrorType = NumberToHexErrorType | ErrorType

function encodeNumber(
  value: number,
  { signed, size = 256 }: { signed: boolean; size?: number | undefined },
): PreparedParam {
  if (typeof size === 'number') {
    const max = 2n ** (BigInt(size) - (signed ? 1n : 0n)) - 1n
    const min = signed ? -max - 1n : 0n
    if (value > max || value < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size / 8,
        value: value.toString(),
      })
  }
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed,
    }),
  }
}

type EncodeStringErrorType =
  | ConcatHexErrorType
  | NumberToHexErrorType
  | PadHexErrorType
  | SizeErrorType
  | SliceErrorType
  | StringToHexErrorType
  | ErrorType

function encodeString(value: string): PreparedParam {
  const hexValue = stringToHex(value)
  const partsLength = Math.ceil(size(hexValue) / 32)
  const parts: Hex[] = []
  for (let i = 0; i < partsLength; i++) {
    parts.push(
      padHex(slice(hexValue, i * 32, (i + 1) * 32), {
        dir: 'right',
      }),
    )
  }
  return {
    dynamic: true,
    encoded: concatHex([
      padHex(numberToHex(size(hexValue), { size: 32 })),
      ...parts,
    ]),
  }
}

type EncodeTupleErrorType =
  | ConcatHexErrorType
  | EncodeParamsErrorType
  // TODO: Add back once circular type reference is resolved
  // | PrepareParamErrorType
  | ErrorType

function encodeTuple<
  const param extends AbiParameter & { components: readonly AbiParameter[] },
>(
  value: AbiParameterToPrimitiveType<param>,
  { param }: { param: param },
): PreparedParam {
  let dynamic = false
  const preparedParams: PreparedParam[] = []
  for (let i = 0; i < param.components.length; i++) {
    const param_ = param.components[i]
    const index = Array.isArray(value) ? i : param_.name
    const preparedParam = prepareParam({
      param: param_,
      value: (value as any)[index!] as readonly unknown[],
    })
    preparedParams.push(preparedParam)
    if (preparedParam.dynamic) dynamic = true
  }
  return {
    dynamic,
    encoded: dynamic
      ? encodeParams(preparedParams)
      : concatHex(preparedParams.map(({ encoded }) => encoded)),
  }
}

type GetArrayComponentsErrorType = ErrorType

export function getArrayComponents(
  type: string,
): [length: number | null, innerType: string] | undefined {
  const matches = type.match(/^(.*)\[(\d+)?\]$/)
  return matches
    ? // Return `null` if the array is dynamic.
      [matches[2] ? Number(matches[2]) : null, matches[1]]
    : undefined
}

function isDynamicType(param: AbiParameter): boolean {
  const { type } = param
  if (type === 'string') return true
  if (type === 'bytes') return true
  if (type.endsWith('[]')) return true
  if (type === 'tuple')
    return (param as TupleAbiParameter).components.some(isDynamicType)
  const arrayComponents = getArrayComponents(type)
  if (arrayComponents)
    return isDynamicType({ ...param, type: arrayComponents[1] })
  return false
}
