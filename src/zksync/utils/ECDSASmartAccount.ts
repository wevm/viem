import type { Address } from 'abitype'
import { signMessage } from '../../accounts/index.js'
import type { Hex } from '../../types/misc.js'
import type { SmartAccountParams } from '../accounts/types.js'

export type ECDSASmartAccountParams = {
  address: Address
  addressAccount?: Address
  secretKey: Hex
}

export function generateECDSASmartAccountParams({
  address,
  addressAccount,
  secretKey,
}: ECDSASmartAccountParams): SmartAccountParams<Hex> {
  return {
    address,
    addressAccount: addressAccount ?? address,
    async sign(payload: Hex) {
      return await signMessage({ message: payload, privateKey: secretKey })
    },
  }
}
