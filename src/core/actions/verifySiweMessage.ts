import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as PersonalMessage from 'ox/PersonalMessage'
import * as Siwe from 'ox/Siwe'

import type * as Client from '../Client.js'
import { verifyHash } from './verifyHash.js'

/**
 * Verifies that an [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361)
 * formatted message was signed, supporting Smart Contract Accounts
 * (ERC-1271/6492/8010) and Externally Owned Accounts.
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
 * const valid = await Actions.verifySiweMessage(client, {
 *   message: 'example.com wants you to sign in with your Ethereum account…',
 *   signature: '0x…',
 * })
 * ```
 */
export async function verifySiweMessage(
  client: Client.Client,
  options: verifySiweMessage.Options,
): Promise<verifySiweMessage.ReturnType> {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    time = new Date(),
    ...rest
  } = options

  const parsed = Siwe.parseMessage(message)
  if (!parsed.address) return false

  const valid = Siwe.validateMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time,
  })
  if (!valid) return false

  return verifyHash(client, {
    ...rest,
    address: parsed.address,
    hash: PersonalMessage.getSignPayload(Hex.fromString(message)),
  } as verifyHash.Options)
}

export declare namespace verifySiweMessage {
  type Options = Omit<verifyHash.Options, 'address' | 'hash'> & {
    /** Ethereum address to check against (defaults to the address in the message). */
    address?: Address.Address | undefined
    /** [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) authority to check against. */
    domain?: string | undefined
    /** EIP-4361 formatted message. */
    message: string
    /** Random string to check against. */
    nonce?: string | undefined
    /** [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) URI scheme to check against. */
    scheme?: string | undefined
    /** Current time to check optional `expirationTime` and `notBefore` fields against. @default new Date() */
    time?: Date | undefined
  }

  type ReturnType = boolean

  type ErrorType =
    | PersonalMessage.getSignPayload.ErrorType
    | verifyHash.ErrorType
    | Errors.GlobalErrorType
}
