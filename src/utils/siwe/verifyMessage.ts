import type { Address } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type GetAddressErrorType, getAddress } from '../address/getAddress.js'
import {
  type IsAddressEqualErrorType,
  isAddressEqual,
} from '../address/isAddressEqual.js'
import {
  type RecoverMessageAddressErrorType,
  recoverMessageAddress,
} from '../signature/recoverMessageAddress.js'
import { parseMessage } from './parseMessage.js'

export type VerifyMessageParameters = {
  address?: Address | undefined
  domain?: string | undefined
  message: string
  nonce?: string | undefined
  scheme?: string | undefined
  signature: Hex
  // TODO: `Date` or `string`?
  time?: Date | undefined
}

export type VerifyMessageReturnType = boolean

export type VerifyMessageErrorType =
  | IsAddressEqualErrorType
  | GetAddressErrorType
  | RecoverMessageAddressErrorType
  | ErrorType

/**
 * @description Verifies EIP-4361 formated message.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
export async function verifyMessage(
  parameters: VerifyMessageParameters,
): Promise<VerifyMessageReturnType> {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    signature,
    time = new Date(),
  } = parameters

  const parsed = parseMessage(message)

  if (!parsed.address) return false
  if (address && isAddressEqual(parsed.address, address)) return false
  if (domain && parsed.domain !== domain) return false
  if (nonce && parsed.nonce !== nonce) return false
  if (scheme && parsed.scheme !== scheme) return false

  if (parsed.expirationTime && time >= new Date(parsed.expirationTime))
    return false
  if (parsed.notBefore && time < new Date(parsed.notBefore)) return false

  return isAddressEqual(
    getAddress(parsed.address),
    await recoverMessageAddress({ message, signature }),
  )
}
