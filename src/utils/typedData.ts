import type {
  TypedData,
  TypedDataDomain,
  TypedDataParameter,
  TypedDataType,
} from 'abitype'

import { BytesSizeMismatchError } from '../errors/abi.js'
import { InvalidAddressError } from '../errors/address.js'
import type { Hex } from '../types/misc.js'
import type { TypedDataDefinition } from '../types/typedData.js'

import { isAddress } from './address/isAddress.js'
import { size } from './data/size.js'
import { numberToHex } from './encoding/toHex.js'
import { bytesRegex, integerRegex } from './regex.js'
import { hashDomain } from './signature/hashTypedData.js'

export function validateTypedData<
  const TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
>({
  domain,
  message,
  primaryType,
  types: types_,
}: TypedDataDefinition<TTypedData, TPrimaryType>) {
  const types = types_ as TypedData

  const validateData = (
    struct: readonly TypedDataParameter[],
    value_: Record<string, unknown>,
  ) => {
    for (const param of struct) {
      const { name, type: type_ } = param
      const type = type_ as TypedDataType
      const value = value_[name]

      const integerMatch = type.match(integerRegex)
      if (
        integerMatch &&
        (typeof value === 'number' || typeof value === 'bigint')
      ) {
        const [_type, base, size_] = integerMatch
        // If number cannot be cast to a sized hex value, it is out of range
        // and will throw.
        numberToHex(value, {
          signed: base === 'int',
          size: parseInt(size_) / 8,
        })
      }

      if (type === 'address' && typeof value === 'string' && !isAddress(value))
        throw new InvalidAddressError({ address: value })

      const bytesMatch = type.match(bytesRegex)
      if (bytesMatch) {
        const [_type, size_] = bytesMatch
        if (size_ && size(value as Hex) !== parseInt(size_))
          throw new BytesSizeMismatchError({
            expectedSize: parseInt(size_),
            givenSize: size(value as Hex),
          })
      }

      const struct = types[type]
      if (struct) validateData(struct, value as Record<string, unknown>)
    }
  }

  // Validate domain types.
  if (types.EIP712Domain && domain) validateData(types.EIP712Domain, domain)

  if (primaryType !== 'EIP712Domain') {
    // Validate message types.
    const type = types[primaryType]
    validateData(type, message as Record<string, unknown>)
  }
}

export function getTypesForEIP712Domain({
  domain,
}: { domain?: TypedDataDomain }): TypedDataParameter[] {
  return [
    typeof domain?.name === 'string' && { name: 'name', type: 'string' },
    domain?.version && { name: 'version', type: 'string' },
    typeof domain?.chainId === 'number' && {
      name: 'chainId',
      type: 'uint256',
    },
    domain?.verifyingContract && {
      name: 'verifyingContract',
      type: 'address',
    },
    domain?.salt && { name: 'salt', type: 'bytes32' },
  ].filter(Boolean) as TypedDataParameter[]
}

export function domainSeparator({ domain }: { domain: TypedDataDomain }): Hex {
  return hashDomain({
    domain,
    types: {
      EIP712Domain: getTypesForEIP712Domain({ domain }),
    },
  })
}
