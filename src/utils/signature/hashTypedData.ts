// Implementation forked and adapted from https://github.com/MetaMask/eth-sig-util/blob/main/src/sign-typed-data.ts

import type { AbiParameter, TypedData } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import type {
  EIP712DomainDefinition,
  MessageDefinition,
  TypedDataDefinition,
} from '../../types/typedData.js'
import type { UnionOmit } from '../../types/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../abi/encodeAbiParameters.js'
import { concat } from '../data/concat.js'
import { type ToHexErrorType, toHex } from '../encoding/toHex.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import {
  type GetTypesForEIP712DomainErrorType,
  getTypesForEIP712Domain,
  type ValidateTypedDataErrorType,
  validateTypedData,
} from '../typedData.js'

type MessageTypeProperty = {
  name: string
  type: string
}

export type HashTypedDataParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
> = TypedDataDefinition<typedData, primaryType>

export type HashTypedDataReturnType = Hex

export type HashTypedDataErrorType =
  | GetTypesForEIP712DomainErrorType
  | HashDomainErrorType
  | HashStructErrorType
  | ValidateTypedDataErrorType
  | ErrorType

export function hashTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  parameters: HashTypedDataParameters<typedData, primaryType>,
): HashTypedDataReturnType {
  const {
    domain = {},
    message,
    primaryType,
  } = parameters as HashTypedDataParameters
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types,
  }

  // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
  // as we can't statically check this with TypeScript.
  validateTypedData({
    domain,
    message,
    primaryType,
    types,
  })

  const parts: Hex[] = ['0x1901']
  if (domain)
    parts.push(
      hashDomain({
        domain,
        types: types as Record<string, MessageTypeProperty[]>,
      }),
    )

  if (primaryType !== 'EIP712Domain')
    parts.push(
      hashStruct({
        data: message,
        primaryType,
        types: types as Record<string, MessageTypeProperty[]>,
      }),
    )

  return keccak256(concat(parts))
}

export type HashDomainErrorType = HashStructErrorType | ErrorType

export function hashDomain<
  const typedData extends TypedData | Record<string, unknown> = TypedData,
>({
  domain,
  types,
}: UnionOmit<EIP712DomainDefinition<typedData>, 'primaryType'>) {
  return hashStruct({
    data: domain as Record<string, unknown>,
    primaryType: 'EIP712Domain',
    types: types as Record<string, readonly MessageTypeProperty[]>,
  })
}

export type HashStructErrorType =
  | EncodeDataErrorType
  | Keccak256ErrorType
  | ErrorType

export function hashStruct<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>({
  data,
  primaryType,
  types,
}: MessageDefinition<typedData, primaryType, 'data'>) {
  const encoded = encodeData({
    data: data as Record<string, unknown>,
    primaryType,
    types: types as Record<string, readonly MessageTypeProperty[]>,
  })
  return keccak256(encoded)
}

type EncodeDataErrorType =
  | EncodeAbiParametersErrorType
  | EncodeFieldErrorType
  | HashTypeErrorType
  | ErrorType

function encodeData({
  data,
  primaryType,
  types,
}: {
  data: Record<string, unknown>
  primaryType: string
  types: Record<string, readonly MessageTypeProperty[]>
}) {
  const encodedTypes: AbiParameter[] = [{ type: 'bytes32' }]
  const encodedValues: unknown[] = [hashType({ primaryType, types })]

  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name],
    })
    encodedTypes.push(type)
    encodedValues.push(value)
  }

  return encodeAbiParameters(encodedTypes, encodedValues)
}

type HashTypeErrorType =
  | ToHexErrorType
  | EncodeTypeErrorType
  | Keccak256ErrorType
  | ErrorType

function hashType({
  primaryType,
  types,
}: {
  primaryType: string
  types: Record<string, readonly MessageTypeProperty[]>
}) {
  const encodedHashType = toHex(encodeType({ primaryType, types }))
  return keccak256(encodedHashType)
}

type EncodeTypeErrorType = FindTypeDependenciesErrorType

export function encodeType({
  primaryType,
  types,
}: {
  primaryType: string
  types: Record<string, readonly MessageTypeProperty[]>
}) {
  let result = ''
  const unsortedDeps = findTypeDependencies({ primaryType, types })
  unsortedDeps.delete(primaryType)

  const deps = [primaryType, ...Array.from(unsortedDeps).sort()]
  for (const type of deps) {
    result += `${type}(${types[type]
      .map(({ name, type: t }) => `${t} ${name}`)
      .join(',')})`
  }

  return result
}

type FindTypeDependenciesErrorType = ErrorType

function findTypeDependencies(
  {
    primaryType: primaryType_,
    types,
  }: {
    primaryType: string
    types: Record<string, readonly MessageTypeProperty[]>
  },
  results: Set<string> = new Set(),
): Set<string> {
  const match = primaryType_.match(/^\w*/u)
  const primaryType = match?.[0]!
  if (results.has(primaryType) || types[primaryType] === undefined) {
    return results
  }

  results.add(primaryType)

  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results)
  }
  return results
}

type EncodeFieldErrorType =
  | Keccak256ErrorType
  | EncodeAbiParametersErrorType
  | ToHexErrorType
  | ErrorType

function encodeField({
  types,
  name,
  type,
  value,
}: {
  types: Record<string, readonly MessageTypeProperty[]>
  name: string
  type: string
  value: any
}): [type: AbiParameter, value: any] {
  if (types[type] !== undefined) {
    return [
      { type: 'bytes32' },
      keccak256(encodeData({ data: value, primaryType: type, types })),
    ]
  }

  if (type === 'bytes') return [{ type: 'bytes32' }, keccak256(value)]

  if (type === 'string') return [{ type: 'bytes32' }, keccak256(toHex(value))]

  if (type.lastIndexOf(']') === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf('['))
    const typeValuePairs = (value as [AbiParameter, any][]).map((item) =>
      encodeField({
        name,
        type: parsedType,
        types,
        value: item,
      }),
    )
    return [
      { type: 'bytes32' },
      keccak256(
        encodeAbiParameters(
          typeValuePairs.map(([t]) => t),
          typeValuePairs.map(([, v]) => v),
        ),
      ),
    ]
  }

  return [{ type }, value]
}
