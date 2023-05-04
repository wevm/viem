import type { ByteArray, Hex } from '../../types/misc.js'
import { getAddress } from '../address/getAddress.js'
import { isAddressEqual } from '../address/isAddressEqual.js'
import { recoverMessageAddress } from './recoverMessageAddress.js'
import type { Address } from 'abitype'

export type VerifyMessageParameters = {
  address: Address
  message: string
  signature: Hex | ByteArray
}

export type VerifyMessageReturnType = boolean

export async function verifyMessage({
  address,
  message,
  signature,
}: VerifyMessageParameters): Promise<VerifyMessageReturnType> {
  return isAddressEqual(
    getAddress(address),
    await recoverMessageAddress({ message, signature }),
  )
}
