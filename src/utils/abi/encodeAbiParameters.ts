import type {
  AbiParameter,
  AbiParameterKind,
  AbiParametersToPrimitiveTypes,
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
import {
  IntegerOutOfRangeError,
  type IntegerOutOfRangeErrorType,
} from '../../errors/encoding.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import { type PadHexErrorType, padHex } from '../data/pad.js'
import { type SizeErrorType, size } from '../data/size.js'
import {
  type NumberToHexErrorType,
  numberToHex,
  type StringToHexErrorType,
  stringToHex,
} from '../encoding/toHex.js'
import { bytesRegex, integerRegex } from '../regex.js'

export type EncodeAbiParametersReturnType = Hex

export type EncodeAbiParametersErrorType =
  | AbiEncodingArrayLengthMismatchErrorType
  | AbiEncodingLengthMismatchErrorType
  | EncodeBytesErrorType
  | IntegerOutOfRangeErrorType
  | InvalidAbiEncodingTypeErrorType
  | InvalidAddressErrorType
  | InvalidArrayErrorType
  | IsAddressErrorType
  | NumberToHexErrorType
  | StringToHexErrorType
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
 * A parameter parsed once per call. Values the fast path does not handle go
 * through the same checks and encoders as before, so output and errors stay
 * the same.
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
  // Malformed parameters throw once they are encoded.
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
    if (components === undefined || components === null) return compiled
    compiled.kind = 'tuple'
    // Indexed like an array, so holes and array-likes reach `compile`.
    compiled.components = Array.from({ length: components.length }, (_, i) =>
      compile(components[i]!),
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
  } else if (type.startsWith('bytes')) {
    compiled.kind = 'bytes'
    // Malformed sizes (e.g. `bytes33`) skip the fast path.
    compiled.size = bytesRegex.test(type) ? Number(type.slice(5)) : -1
    compiled.dynamic = !type.split('bytes')[1]
  } else if (type === 'string') {
    compiled.kind = 'string'
    compiled.dynamic = true
  }
  return compiled
}

/** Encodes a value as un-prefixed hex. */
function encode(compiled: CompiledParam, value: unknown): string {
  const { kind, param } = compiled
  if (kind === 'array') return encodeArrayValue(compiled, value)
  if (kind === 'tuple') return encodeTupleValue(compiled, value)
  if (kind === 'address') {
    if (!isAddress(value as Hex))
      throw new InvalidAddressError({ address: value as Hex })
    return `000000000000000000000000${(value as Hex).toLowerCase().slice(2)}`
  }
  if (kind === 'bool') {
    if (typeof value !== 'boolean')
      throw new BaseError(
        `Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`,
      )
    return value ? `${zeros.slice(1)}1` : zeros
  }
  if (kind === 'bytes') {
    const { size } = compiled
    if (
      typeof value === 'string' &&
      value.length % 2 === 0 &&
      value.startsWith('0x') &&
      value.indexOf('0x', 2) === -1
    ) {
      const data = value.slice(2)
      const length = data.length / 2
      if (size === 0)
        return word(length) + data.padEnd(Math.ceil(length / 32) * 64, '0')
      if (length === size) return data.padEnd(64, '0')
    }
    // Odd-length, malformed or mis-sized values.
    return encodeBytes(value as Hex, { param }).encoded.slice(2)
  }
  if (kind === 'number') {
    const { max, min, signed, size } = compiled
    if ((value as bigint) > max || (value as bigint) < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size / 8,
        value: (value as bigint).toString(),
      })
    if (
      typeof value !== 'bigint' &&
      !(typeof value === 'number' && Number.isSafeInteger(value))
    )
      return numberToHex(value as number, { size: 32, signed }).slice(2)
    const hex = (value < 0 ? (1n << 256n) + BigInt(value) : value).toString(16)
    return zeros.slice(hex.length) + hex
  }
  if (kind === 'string') {
    const data = stringToHex(value as string).slice(2)
    const remainder = data.length % 64
    return (
      word(data.length / 2) + data + (remainder ? zeros.slice(remainder) : '')
    )
  }
  // Reading a malformed parameter's `type` or `components` throws a
  // `TypeError`, as before.
  const type = param.type
  getArrayComponents(type)
  if (type === 'tuple')
    (param as TupleAbiParameter).components.length satisfies number
  throw new InvalidAbiEncodingTypeError(type, {
    docsPath: '/docs/contract/encodeAbiParameters',
  })
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
