import type { Address } from 'abitype'

import { sign } from '../../accounts/utils/sign.js'
import type { Hex } from '../../types/misc.js'
import type { ZksyncSmartAccount } from '../types/account.js'
import { toSmartAccount } from './toSmartAccount.js'

export type ToSinglesigSmartAccountParameters = {
  /** Address of the deployed Account's Contract implementation. */
  address: Address
  /** Private Key of the owner. */
  privateKey: Hex
}

/**
 * Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts)
 * from a Contract Address and a Private Key belonging to the owner.
 */
export function toSinglesigSmartAccount(
  parameters: ToSinglesigSmartAccountParameters,
): ZksyncSmartAccount {
  const { address, privateKey } = parameters

  return toSmartAccount({
    address,
    async sign({ hash }) {
      return sign({ hash, privateKey, to: 'hex' })
    },
  })
}
