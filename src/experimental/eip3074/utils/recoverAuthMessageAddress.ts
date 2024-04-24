import type { Address } from 'abitype'

import type { ByteArray, Hex, Signature } from '../../../types/misc.js'

import type { ErrorType } from '../../../errors/utils.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import {
  type RecoverAddressErrorType,
  recoverAddress,
} from '../../../utils/signature/recoverAddress.js'
import { type ToAuthMessageParameters, toAuthMessage } from './toAuthMessage.js'

export type RecoverAuthMessageAddressParameters = ToAuthMessageParameters & {
  signature: Hex | ByteArray | Signature
}

export type RecoverAuthMessageAddressReturnType = Address

export type RecoverAuthMessageAddressErrorType =
  | RecoverAddressErrorType
  | ErrorType

export async function recoverAuthMessageAddress({
  signature,
  ...parameters
}: RecoverAuthMessageAddressParameters): Promise<RecoverAuthMessageAddressReturnType> {
  const hash = keccak256(toAuthMessage(parameters))
  return recoverAddress({ hash, signature })
}
