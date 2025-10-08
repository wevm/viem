import { BaseError } from './base.js'

export type InvalidAddressErrorType = InvalidAddressError & {
  name: 'InvalidAddressError'
}
// TODO: Use `@link` in TSDoc
/**
 * @deprecated Use `Address.InvalidAddressError` instead from `import { Address } from 'viem/utils'`
 */
export class InvalidAddressError extends BaseError {
  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`, {
      metaMessages: [
        '- Address must be a hex value of 20 bytes (40 hex characters).',
        '- Address must match its checksum counterpart.',
      ],
      name: 'InvalidAddressError',
    })
  }
}
