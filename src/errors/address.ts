import { Address } from '../types'
import { BaseError } from './base'

export class InvalidAddressError extends BaseError {
  name = 'InvalidAddressError'
  constructor({ address }: { address: Address }) {
    super(`Address "${address}" is invalid.`)
  }
}
