import type { TypedData } from 'abitype'

import { stringify } from '../utils/stringify.js'
import { BaseError } from './base.js'

export type InvalidDomainErrorType = InvalidDomainError & {
  name: 'InvalidDomainError'
}
export class InvalidDomainError extends BaseError {
  constructor({ domain }: { domain: unknown }) {
    super(`Invalid domain "${stringify(domain)}".`, {
      metaMessages: ['Must be a valid EIP-712 domain.'],
    })
  }
}

export type InvalidPrimaryTypeErrorType = InvalidPrimaryTypeError & {
  name: 'InvalidPrimaryTypeError'
}
export class InvalidPrimaryTypeError extends BaseError {
  constructor({
    primaryType,
    types,
  }: { primaryType: string; types: TypedData | Record<string, unknown> }) {
    super(
      `Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`,
      {
        docsPath: '/api/glossary/Errors#typeddatainvalidprimarytypeerror',
        metaMessages: ['Check that the primary type is a key in `types`.'],
      },
    )
  }
}

export type InvalidStructTypeErrorType = InvalidStructTypeError & {
  name: 'InvalidStructTypeError'
}
export class InvalidStructTypeError extends BaseError {
  constructor({ type }: { type: string }) {
    super(`Struct type "${type}" is invalid.`, {
      metaMessages: ['Struct type must not be a Solidity type.'],
      name: 'InvalidStructTypeError',
    })
  }
}
