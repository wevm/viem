import * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import type { blockParameter } from '../internal/blockParameter.js'
import { getCode } from './getCode.js'

/**
 * Returns the address that an account has delegated to via EIP-7702.
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
 * const delegation = await Actions.address.getDelegation(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 * ```
 */
export async function getDelegation(
  client: Client.Client,
  options: getDelegation.Options,
): Promise<getDelegation.ReturnType> {
  const code = await getCode(client, options)

  // EIP-7702 delegation designator: `0xef0100` prefix (3 bytes) followed by a
  // 20-byte address (23 bytes total).
  if (!code) return undefined
  if (Hex.size(code) !== 23) return undefined
  if (!code.startsWith('0xef0100')) return undefined

  return Address.checksum(Hex.slice(code, 3, 23))
}

export declare namespace getDelegation {
  type Options = {
    /** The address to check for delegation. */
    address: Address.Address
  } & blockParameter.BlockOptions

  type ReturnType = Address.Address | undefined

  type ErrorType =
    | getCode.ErrorType
    | Address.checksum.ErrorType
    | Hex.size.ErrorType
    | Hex.slice.ErrorType
    | Errors.GlobalErrorType
}
