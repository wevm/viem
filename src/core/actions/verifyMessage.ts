import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as PersonalMessage from 'ox/PersonalMessage'

import type * as Account from '../Account.js'
import type * as Client from '../Client.js'
import { verifyHash } from './verifyHash.js'

/**
 * Verifies that a message was signed by the provided address, supporting
 * Smart Contract Accounts (ERC-1271/6492/8010) and Externally Owned Accounts.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const valid = await Actions.verifyMessage(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   message: 'hello world',
 *   signature: '0x…',
 * })
 * ```
 */
export async function verifyMessage(
  client: Client.Client,
  options: verifyMessage.Options,
): Promise<verifyMessage.ReturnType> {
  const { message, ...rest } = options

  const data = (() => {
    if (typeof message === 'string') return Hex.fromString(message)
    if (message.raw instanceof Uint8Array) return Hex.fromBytes(message.raw)
    return message.raw
  })()

  return verifyHash(client, {
    ...rest,
    hash: PersonalMessage.getSignPayload(data),
  } as verifyHash.Options)
}

export declare namespace verifyMessage {
  type Options = Omit<verifyHash.Options, 'hash'> & {
    /** The message that was signed. */
    message: Account.SignableMessage
  }

  type ReturnType = boolean

  type ErrorType =
    | PersonalMessage.getSignPayload.ErrorType
    | verifyHash.ErrorType
    | Errors.GlobalErrorType
}
