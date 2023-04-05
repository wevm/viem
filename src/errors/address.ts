import { BaseError } from './base.js'

export class InvalidAddressError extends BaseError {
  name = 'InvalidAddressError'
  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`)
  }
}
