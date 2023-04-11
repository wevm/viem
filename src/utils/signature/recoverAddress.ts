import type { Address, ByteArray, Hex } from '../../types/index.js'
import { publicKeyToAddress } from '../accounts.js'
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
