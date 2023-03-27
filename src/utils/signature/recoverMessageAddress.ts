import type { Address, ByteArray, Hex } from '../../types/index.js'
import { hashMessage } from './hashMessage.js'
import { recoverAddress } from './recoverAddress.js'

export type RecoverMessageAddressParameters = {
  message: string
  signature: Hex | ByteArray
}
export type RecoverMessageAddressReturnType = Address

export function recoverMessageAddress({
  message,
  signature,
}: RecoverMessageAddressParameters): RecoverMessageAddressReturnType {
  return recoverAddress({ hash: hashMessage(message), signature })
}
