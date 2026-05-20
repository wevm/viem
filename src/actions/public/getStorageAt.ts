import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { toRpcBlock } from './internal/toRpcBlock.js'

/**
 * Returns the value at a storage slot.
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
 * const value = await actions.public.getStorageAt(client, {
 *   address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
 *   slot: '0x0',
 * })
 * // @log: '0x0000000000000000000000000000000000000000000000000000000000000000'
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Storage value.
 */
export async function getStorageAt<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getStorageAt.Options,
): getStorageAt.ReturnType {
  const { address, slot, ...block } = options
  const value = await client.request({
    method: 'eth_getStorageAt',
    params: [address, slot, toRpcBlock(block)],
  })
  return value as Hex.Hex
}

export declare namespace getStorageAt {
  type Options = {
    /** Account address. */
    address: Address.Address
    /** Storage slot. */
    slot: Hex.Hex
  } & toRpcBlock.Options

  type ReturnType = Promise<Hex.Hex>

  type ErrorType = toRpcBlock.ErrorType
}
