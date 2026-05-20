import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Block from '../../utils/Block.js'

/**
 * Returns the balance of an address in wei.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const balance = await actions.public.getBalance(client, {
 *   address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
 * })
 * // @log: 1000000000000000000n
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Balance in wei.
 */
export async function getBalance<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getBalance.Options,
): getBalance.ReturnType {
  const {
    address,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
  } = options
  const balance = await client.request({
    method: 'eth_getBalance',
    params: [
      address,
      blockNumber !== undefined ? Hex.fromNumber(blockNumber) : blockTag,
    ],
  })
  return Hex.toBigInt(balance as Hex.Hex)
}

export declare namespace getBalance {
  type Options = {
    /** Account address. */
    address: Address.Address
  } & (
    | {
        /** Block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** Block tag. */
        blockTag?: Block.Tag | undefined
      }
  )

  type ReturnType = Promise<bigint>

  type ErrorType = Hex.fromNumber.ErrorType | Hex.toBigInt.ErrorType
}
