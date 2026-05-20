import * as Address from 'ox/Address'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Block from '../../utils/Block.js'
import * as Hex from '../../utils/Hex.js'
import { getCode } from './getCode.js'

const delegationPrefix = '0xef0100'
const delegationSize = 23

/**
 * Returns the address that an account has delegated to via EIP-7702, or
 * `undefined` if the account has no delegation designator.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const delegation = await actions.getDelegation(client, {
 *   address: '0x0000000000000000000000000000000000000000'
 * })
 * // @log: '0x...' | undefined
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Delegated address or `undefined`.
 */
export async function getDelegation<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getDelegation.Options,
): getDelegation.ReturnType {
  const code = await getCode(client, options)
  if (!code) return undefined
  if (Hex.size(code) !== delegationSize) return undefined
  if (!code.startsWith(delegationPrefix)) return undefined
  return Address.from(Hex.slice(code, 3, delegationSize), { checksum: true })
}

export declare namespace getDelegation {
  type Options = {
    /** Account address to check. */
    address: Address.Address
  } & (
    | {
        blockNumber?: undefined
        /** Block tag to read from. */
        blockTag?: Block.Tag | undefined
      }
    | {
        /** Block number to read from. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
  )

  type ReturnType = Promise<Address.Address | undefined>

  type ErrorType =
    | getCode.ErrorType
    | Hex.size.ErrorType
    | Hex.slice.ErrorType
    | Address.from.ErrorType
}
