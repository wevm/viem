import type { Address } from 'abitype'
import { signMessage } from '../../accounts/index.js'
import type { Hex } from '../../types/misc.js'
import { concat } from '../../utils/index.js'
import type { SmartAccountParams } from '../accounts/types.js'

export type MultisigECDSASmartAccount = {
  address: Address
  addressAccount?: Address
  secretKeys: Hex[]
}

export function generateMultisigECDSASmartAccountParams({
  address,
  addressAccount,
  secretKeys,
}: MultisigECDSASmartAccount): SmartAccountParams<Hex> {
  return {
    address,
    addressAccount: addressAccount ?? address,
    async sign(payload: Hex) {
      if (secretKeys.length < 2) {
        throw new Error(
          'Multiple keys are required for multisig transaction signing!',
        )
      }

      const signatures = await Promise.all(
        secretKeys.map(async (secretKey) => {
          return await signMessage({ message: payload, privateKey: secretKey })
        }),
      )

      return concat(signatures)
    },
  }
}
