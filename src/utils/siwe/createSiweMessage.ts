import * as Siwe from 'ox/Siwe'

import type { ErrorType } from '../../errors/utils.js'

export type CreateSiweMessageParameters = Siwe.Message

export type CreateSiweMessageReturnType = string

export type CreateSiweMessageErrorType =
  | Siwe.createMessage.ErrorType
  | ErrorType

/**
 * @description Creates EIP-4361 formatted message.
 *
 * @example
 * const message = createMessage({
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   chainId: 1,
 *   domain: 'example.com',
 *   nonce: 'foobarbaz',
 *   uri: 'https://example.com/path',
 *   version: '1',
 * })
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
export function createSiweMessage(
  parameters: CreateSiweMessageParameters,
): CreateSiweMessageReturnType {
  return Siwe.createMessage(parameters)
}
