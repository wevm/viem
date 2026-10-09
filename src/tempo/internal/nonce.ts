import { BaseError } from '../../errors/base.js'

/** Rejects nonce keys in the reserved subblock range. */
export function assertNonceKey(nonceKey: bigint | 'expiring' | undefined) {
  // The prefix is the most significant byte of the full uint256 key.
  if (typeof nonceKey === 'bigint' && nonceKey >> 248n === 0x5bn)
    throw new ReservedNonceKeyError()
}

/** Thrown when a transaction uses a nonce key reserved for subblocks. */
export class ReservedNonceKeyError extends BaseError {
  constructor() {
    super('Nonce keys with the 0x5b prefix are reserved for subblocks.', {
      metaMessages: [
        'Choose a nonce key with a different first byte in its 32-byte representation.',
      ],
      name: 'Nonce.ReservedNonceKeyError',
    })
  }
}
