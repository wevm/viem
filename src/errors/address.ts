import { BaseError } from './base.js'

export type InvalidAddressErrorType = InvalidAddressError & {
  name: 'InvalidAddressError'
}
export class InvalidAddressError extends BaseError {
  override name = 'InvalidAddressError'
  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`)
  }
}
