import type { Address, ByteArray, Hex } from '../../types'
import { hashMessage } from './hashMessage'
import { recoverAddress } from './recoverAddress'

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
