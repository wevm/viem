import type {
  AbiParameterToPrimitiveType,
  AbiType,
  Address,
  SolidityAddress,
  SolidityArrayWithoutTuple,
  SolidityBool,
  SolidityBytes,
  SolidityInt,
  SolidityString,
} from 'abitype'

import {
  AbiEncodingLengthMismatchError,
  type AbiEncodingLengthMismatchErrorType,
  BytesSizeMismatchError,
  type BytesSizeMismatchErrorType,
  UnsupportedPackedAbiType,
} from '../../errors/abi.js'
import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../../errors/address.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import { type PadErrorType, pad } from '../data/pad.js'
import {
  type BoolToHexErrorType,
  type NumberToHexErrorType,
  type StringToHexErrorType,
  boolToHex,
  numberToHex,
  stringToHex,
} from '../encoding/toHex.js'
import { arrayRegex, bytesRegex, integerRegex } from '../regex.js'

type PackedAbiType =
  | SolidityAddress
  | SolidityBool
  | SolidityBytes
  | SolidityInt
  | SolidityString
  | SolidityArrayWithoutTuple

type EncodePackedValues<
  TPackedAbiTypes extends readonly PackedAbiType[] | readonly unknown[],
> = {
  [K in keyof TPackedAbiTypes]: TPackedAbiTypes[K] extends AbiType
    ? AbiParameterToPrimitiveType<{ type: TPackedAbiTypes[K] }>
    : unknown
}

export type EncodePackedErrorType =
  | AbiEncodingLengthMismatchErrorType
  | ConcatHexErrorType
  | EncodeErrorType
  | ErrorType

export function encodePacked<
  const TPackedAbiTypes extends readonly PackedAbiType[] | readonly unknown[],
>(types: TPackedAbiTypes, values: EncodePackedValues<TPackedAbiTypes>): Hex {
  if (types.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: types.length as number,
      givenLength: values.length as number,
    })

  const data: Hex[] = []
  for (let i = 0; i < (types as unknown[]).length; i++) {
    const type = types[i]
    const value = values[i]
    data.push(encode(type, value))
  }
  return concatHex(data)
}

type EncodeErrorType =
  | BoolToHexErrorType
  | BytesSizeMismatchErrorType
  | InvalidAddressErrorType
  | IsAddressErrorType
  | NumberToHexErrorType
  | PadErrorType
  | StringToHexErrorType
  | UnsupportedPackedAbiType
  | ErrorType

function encode<const TPackedAbiType extends PackedAbiType | unknown>(
  type: TPackedAbiType,
  value: EncodePackedValues<[TPackedAbiType]>[0],
  isArray = false,
): Hex {
  if (type === 'address') {
    const address = value as Address
    if (!isAddress(address)) throw new InvalidAddressError({ address })
    return pad(address.toLowerCase() as Hex, {
      size: isArray ? 32 : null,
    }) as Address
  }
  if (type === 'string') return stringToHex(value as string)
  if (type === 'bytes') return value as Hex
  if (type === 'bool')
    return pad(boolToHex(value as boolean), { size: isArray ? 32 : 1 })

  const intMatch = (type as string).match(integerRegex)
  if (intMatch) {
    const [_type, baseType, bits = '256'] = intMatch
    const size = parseInt(bits) / 8
    return numberToHex(value as number, {
      size: isArray ? 32 : size,
      signed: baseType === 'int',
    })
  }

  const bytesMatch = (type as string).match(bytesRegex)
  if (bytesMatch) {
    const [_type, size] = bytesMatch
    if (parseInt(size) !== ((value as Hex).length - 2) / 2)
      throw new BytesSizeMismatchError({
        expectedSize: parseInt(size),
        givenSize: ((value as Hex).length - 2) / 2,
      })
    return pad(value as Hex, { dir: 'right', size: isArray ? 32 : null }) as Hex
  }

  const arrayMatch = (type as string).match(arrayRegex)
  if (arrayMatch && Array.isArray(value)) {
    const [_type, childType] = arrayMatch
    const data: Hex[] = []
    for (let i = 0; i < value.length; i++) {
      data.push(encode(childType, value[i], true))
    }
    if (data.length === 0) return '0x'
    return concatHex(data)
  }

  throw new UnsupportedPackedAbiType(type)
}
