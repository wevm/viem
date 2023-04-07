import { InvalidAddressError } from '../../errors/index.js'
import type { Address } from '../../types/index.js'
import { stringToBytes } from '../encoding/index.js'
import { keccak256 } from '../hash/index.js'
import { isAddress } from './isAddress.js'

export function checksumAddress(address_: Address): Address {
  const hexAddress = address_.substring(2).toLowerCase()
  const hash = keccak256(stringToBytes(hexAddress), 'bytes')

  const address = hexAddress.split('')
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

export function getAddress(address: string): Address {
  if (!isAddress(address)) throw new InvalidAddressError({ address })
  return checksumAddress(address)
}
