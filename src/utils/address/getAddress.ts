import type { Address } from 'abitype'

import { InvalidAddressError } from '../../errors/address.js'
import type { ErrorType } from '../../errors/utils.js'
import {
  type StringToBytesErrorType,
  stringToBytes,
} from '../encoding/toBytes.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import { type IsAddressErrorType, isAddress } from './isAddress.js'

export type ChecksumAddressErrorType =
  | Keccak256ErrorType
  | StringToBytesErrorType
  | ErrorType

export function checksumAddress(address_: Address, chainId?: number): Address {
  const hexAddress = chainId
    ? `${chainId}${address_.toLowerCase()}`
    : address_.substring(2).toLowerCase()
  const hash = keccak256(stringToBytes(hexAddress), 'bytes')

  const address = (
    chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress
  ).split('')
  for (let i = 0; i < 40; i += 2) {
    if (hash[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase()
    }
    if ((hash[i >> 1] & 0x0f) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase()
    }
  }

  return `0x${address.join('')}`
}

export type GetAddressErrorType =
  | ChecksumAddressErrorType
  | IsAddressErrorType
  | ErrorType

export function getAddress(address: string, chainId?: number): Address {
  if (!isAddress(address)) throw new InvalidAddressError({ address })
  return checksumAddress(address, chainId)
}
