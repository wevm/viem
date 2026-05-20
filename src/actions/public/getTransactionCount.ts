import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { toRpcBlock } from './internal/toRpcBlock.js'

/**
 * Returns the number of transactions sent from an address.
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
 * const nonce = await actions.public.getTransactionCount(client, {
 *   address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
 * })
 * // @log: 1n
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Transaction count.
 */
export async function getTransactionCount<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getTransactionCount.Options,
): getTransactionCount.ReturnType {
  const { address, ...block } = options
  const count = await client.request(
    {
      method: 'eth_getTransactionCount',
      params: [address, toRpcBlock(block)],
    },
    { dedupe: block.blockNumber !== undefined },
  )
  return Hex.toBigInt(count as Hex.Hex)
}

export declare namespace getTransactionCount {
  type Options = {
    /** Account address. */
    address: Address.Address
  } & toRpcBlock.Options

  type ReturnType = Promise<bigint>

  type ErrorType = toRpcBlock.ErrorType | Hex.toBigInt.ErrorType
}
