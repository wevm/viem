import { signatureToHex } from '../../accounts/index.js'
import { sign } from '../../accounts/utils/sign.js'
import type { Hex } from '../../types/misc.js'
import type {
  SmartAccountAddressesParams,
  SmartAccountParams,
} from '../accounts/types.js'

export type ECDSASmartAccountParams = SmartAccountAddressesParams & {
  secretKey: Hex
}

export function generateECDSASmartAccountParams({
  address,
  addressAccount,
  secretKey,
}: ECDSASmartAccountParams): SmartAccountParams {
  return {
    address,
    addressAccount: addressAccount ?? address,
    async sign(payload: Hex) {
      return signatureToHex(
        await sign({ hash: payload, privateKey: secretKey }),
      )
    },
  }
}
