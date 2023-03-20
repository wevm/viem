import { BaseError } from './base'

export class InvalidAddressError extends BaseError {
  name = 'InvalidAddressError'
  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`)
  }
}

export class InvalidHashError extends BaseError {
  name = 'InvalidHashError'
  constructor({ hash }: { hash: string[] }) {
    super('Contains invalid hash values.', {
      metaMessages: hash,
    })
  }
}
