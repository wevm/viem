import type { Address } from 'ox'

import type { AccessKeyAccount } from '../../Account.js'

/** Resolves an access key input into its address. @internal */
export function resolveAccessKeyAddress(
  accessKey: Address.Address | AccessKeyAccount,
): Address.Address {
  if (typeof accessKey === 'string') return accessKey
  return accessKey.accessKeyAddress
}

/** Access key signature types, keyed by their onchain value. @internal */
export const signatureTypes = {
  0: 'secp256k1',
  1: 'p256',
  2: 'webAuthn',
  3: 'configurable',
} as const satisfies Record<number, string>
