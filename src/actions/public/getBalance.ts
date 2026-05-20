import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { toRpcBlock } from './internal/toRpcBlock.js'

/**
 * Returns the balance of an address in wei.
 *
 * @example
 * ```ts twoslash
 * import { Client, actions, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const balance = await actions.getBalance(client, {
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
  const { address, ...block } = options
  const rpcBlock =
    block.blockHash ||
    block.blockNumber !== undefined ||
    block.requireCanonical !== undefined
      ? toRpcBlock(block)
      : toRpcBlock({ blockTag: block.blockTag ?? client.blockTag ?? 'latest' })
  const balance = await client.request({
    method: 'eth_getBalance',
    params: [address, rpcBlock],
  })
  return Hex.toBigInt(balance)
}

export declare namespace getBalance {
  type Options = {
    /** Account address. */
    address: Address.Address
  } & toRpcBlock.Options

  type ReturnType = Promise<bigint>

  type ErrorType = toRpcBlock.ErrorType | Hex.toBigInt.ErrorType
}
