import { Address } from 'abitype'
import type { WalletClient } from '../../clients'
import { Hex, ByteArray } from '../../types'
import { getAddress, isAddressEqual, recoverAddress } from '../../utils'

export type VerifyMessageParameters = {
  messageHash: Hex | ByteArray
  signature: Hex | ByteArray
  address: Address
}

export type VerifyMessageReturnType = boolean

export async function verifyMessage(
  _client: WalletClient,
  { messageHash, signature, address }: VerifyMessageParameters,
): Promise<VerifyMessageReturnType> {
  return isAddressEqual(
    getAddress(address),
    recoverAddress(messageHash, signature),
  )
}
