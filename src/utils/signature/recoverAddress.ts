import type { Address } from 'abitype'

import { publicKeyToAddress } from '../../accounts/utils/publicKeyToAddress.js'
import type { ByteArray, Hex } from '../../types/misc.js'

import { recoverPublicKey } from './recoverPublicKey.js'

export type RecoverAddressParameters = {
  hash: Hex | ByteArray
  signature: Hex | ByteArray
}
export type RecoverAddressReturnType = Address

export async function recoverAddress({
  hash,
  signature,
}: RecoverAddressParameters): Promise<RecoverAddressReturnType> {
  return publicKeyToAddress(await recoverPublicKey({ hash: hash, signature }))
}
