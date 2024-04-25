import { sign, signatureToHex } from '../../accounts/index.js'
import type { Hex } from '../../types/misc.js'
import { concat } from '../../utils/index.js'
import type {
  SmartAccountAddressesParams,
  SmartAccountParams,
} from '../accounts/types.js'

export type MultisigECDSASmartAccount = SmartAccountAddressesParams & {
  secretKeys: Hex[]
}

export function generateMultisigECDSASmartAccountParams({
  address,
  addressAccount,
  secretKeys,
}: MultisigECDSASmartAccount): SmartAccountParams {
  return {
    address,
    addressAccount: addressAccount ?? address,
    async sign(payload: Hex) {
      if (!secretKeys || secretKeys.length < 2) {
        throw new Error(
          'Multiple keys are required for multisig transaction signing!',
        )
      }

      const signatures = await Promise.all(
        secretKeys.map(async (secretKey) => {
          return signatureToHex(
            await sign({ hash: payload, privateKey: secretKey }),
          )
        }),
      )

      return concat(signatures)
    },
  }
}
