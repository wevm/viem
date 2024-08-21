import type { Address } from 'abitype'

import { sign } from '../../accounts/utils/sign.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/index.js'
import type { ZksyncSmartAccount } from '../types/account.js'
import { toSmartAccount } from './toSmartAccount.js'

export type ToMultisigSmartAccountParameters = {
  /** Address of the deployed Account's Contract implementation. */
  address: Address
  /** Array of Private Keys belonging to the owners. */
  privateKeys: readonly Hex[]
}

/**
 * Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts)
 * from a Contract Address and an array of Private Keys belonging to the owners.
 */
export function toMultisigSmartAccount(
  parameters: ToMultisigSmartAccountParameters,
): ZksyncSmartAccount {
  const { address, privateKeys } = parameters

  return toSmartAccount({
    address,
    async sign({ hash }) {
      return concatHex(
        await Promise.all(
          privateKeys.map((privateKey) =>
            sign({ hash, privateKey, to: 'hex' }),
          ),
        ),
      )
    },
  })
}
