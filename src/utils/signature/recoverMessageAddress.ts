import type { ByteArray, Hex } from '../../types/misc.js'
import { hashMessage } from './hashMessage.js'
import { recoverAddress } from './recoverAddress.js'
import type { Address } from 'abitype'

export type RecoverMessageAddressParameters = {
  message: string
  signature: Hex | ByteArray
}
export type RecoverMessageAddressReturnType = Address

export async function recoverMessageAddress({
  message,
  signature,
}: RecoverMessageAddressParameters): Promise<RecoverMessageAddressReturnType> {
  return recoverAddress({ hash: hashMessage(message), signature })
}
