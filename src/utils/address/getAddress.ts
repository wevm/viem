import type { Address } from '../../types'
import { BaseError } from '../BaseError'
import { stringToBytes } from '../encoding'
import { keccak256 } from '../hash'

const addressRegex = /^(0x)?[a-fA-F0-9]{40}$/

export function checksumAddress(address_: Address): Address {
  const hexAddress = address_.substring(2).toLowerCase()
  const hash = keccak256(stringToBytes(hexAddress), 'bytes')

  let address = hexAddress.split('')
  for (let i = 0; i < 40; i += 2) {
    if (hash?.[i >> 1] >> 4 >= 8) {
      address[i] = address[i].toUpperCase()
    }
    if ((hash[i >> 1] & 0x0f) >= 8) {
      address[i + 1] = address[i + 1].toUpperCase()
    }
  }

  return `0x${address.join('')}`
}

export function getAddress(address: Address) {
  if (!addressRegex.test(address)) throw new InvalidAddressError({ address })
  return checksumAddress(address)
}

export class InvalidAddressError extends BaseError {
  name = 'InvalidAddressError'
  constructor({ address }: { address: Address }) {
    super(`Address "${address}" is invalid.`)
  }
}
