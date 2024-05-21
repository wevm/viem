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
import { parseSiweMessage } from './parseSiweMessage.js'

export type VerifySiweMessageParameters = {
  /**
   * Ethereum address to check against.
   */
  address?: Address | undefined
  /**
   * [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) authority to check against.
   */
  domain?: string | undefined
  /**
   * EIP-4361 formated message.
   */
  message: string
  /**
   * Random string to check against.
   */
  nonce?: string | undefined
  /**
   * [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) URI scheme to check against.
   */
  scheme?: string | undefined
  /**
   * Signature to check against.
   */
  signature: Hex
  /**
   * Current time to check optional `expirationTime` and `notBefore` fields.
   *
   * @default new Date()
   */
  time?: Date | undefined
}

export type VerifySiweMessageReturnType = boolean

export type VerifySiweMessageErrorType =
  | IsAddressEqualErrorType
  | GetAddressErrorType
  | RecoverMessageAddressErrorType
  | ErrorType

/**
 * @description Verifies EIP-4361 formated message.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 *
 * @returns Whether the message is valid.
 */
export async function verifySiweMessage(
  parameters: VerifySiweMessageParameters,
): Promise<VerifySiweMessageReturnType> {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    signature,
    time = new Date(),
  } = parameters

  const parsed = parseSiweMessage(message)

  if (!parsed.address) return false
  if (address && !isAddressEqual(parsed.address, address)) return false
  if (domain && parsed.domain !== domain) return false
  if (nonce && parsed.nonce !== nonce) return false
  if (scheme && parsed.scheme !== scheme) return false

  if (parsed.expirationTime && time >= parsed.expirationTime) return false
  if (parsed.notBefore && time < parsed.notBefore) return false

  return isAddressEqual(
    getAddress(parsed.address),
    await recoverMessageAddress({ message, signature }),
  )
}
