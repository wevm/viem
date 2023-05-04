import { publicKeyToAddress } from '../../accounts/utils/publicKeyToAddress.js'
import type { ByteArray, type Hex } from '../../types/misc.js'
import { recoverPublicKey } from './recoverPublicKey.js'
import type { Address } from 'abitype'

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
