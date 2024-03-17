import { versionedHashVersionKzg } from '../constants/kzg.js'
import type { Hash } from '../types/misc.js'

import { BaseError } from './base.js'

export type BlobSizeTooLargeErrorType = BlobSizeTooLargeError & {
  name: 'BlobSizeTooLargeError'
}
export class BlobSizeTooLargeError extends BaseError {
  override name = 'BlobSizeTooLargeError'
  constructor({ maxSize, size }: { maxSize: number; size: number }) {
    super('Blob size is too large.', {
      metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size} bytes`],
    })
  }
}

export type EmptyBlobErrorType = EmptyBlobError & {
  name: 'EmptyBlobError'
}
export class EmptyBlobError extends BaseError {
  override name = 'EmptyBlobError'
  constructor() {
    super('Blob data must not be empty.')
  }
}

export type InvalidVersionedHashSizeErrorType =
  InvalidVersionedHashSizeError & {
    name: 'InvalidVersionedHashSizeError'
  }
export class InvalidVersionedHashSizeError extends BaseError {
  override name = 'InvalidVersionedHashSizeError'
  constructor({
    hash,
    size,
  }: {
    hash: Hash
    size: number
  }) {
    super(`Versioned hash "${hash}" size is invalid.`, {
      metaMessages: ['Expected: 32', `Received: ${size}`],
    })
  }
}

export type InvalidVersionedHashVersionErrorType =
  InvalidVersionedHashVersionError & {
    name: 'InvalidVersionedHashVersionError'
  }
export class InvalidVersionedHashVersionError extends BaseError {
  override name = 'InvalidVersionedHashVersionError'
  constructor({
    hash,
    version,
  }: {
    hash: Hash
    version: number
  }) {
    super(`Versioned hash "${hash}" version is invalid.`, {
      metaMessages: [
        `Expected: ${versionedHashVersionKzg}`,
        `Received: ${version}`,
      ],
    })
  }
}
