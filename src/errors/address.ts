import { BaseError } from './base.js'

export type InvalidAddressErrorType = InvalidAddressError & {
  name: 'InvalidAddressError'
}
export class InvalidAddressError extends BaseError {
  override name = 'InvalidAddressError'
  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`, {
      metaMessages: [
        '- Address must be a hex value of 20 bytes (40 hex characters).',
        '- Address must match its checksum counterpart.',
      ],
    })
  }
}
