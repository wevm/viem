import type { Address } from 'ox'

import type { AccessKeyAccount } from '../../Account.js'

/** Resolves an access key input into its address. @internal */
export function resolveAccessKeyAddress(
  accessKey: Address.Address | AccessKeyAccount,
): Address.Address {
  if (typeof accessKey === 'string') return accessKey
  return accessKey.accessKeyAddress
}
