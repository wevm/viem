import type * as Client from '../../Client.js'
import { getBlockNumber } from '../public/getBlockNumber.js'
import { getChainId } from '../public/getChainId.js'
import { getGasPrice } from '../public/getGasPrice.js'

/**
 * Bag of public actions bound to a {@link Client}. Pass to `Client.create`'s
 * `.extend`.
 *
 * @example
 * ```ts
 * import { Client, http, publicActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(publicActions())
 * const blockNumber = await client.getBlockNumber()
 * ```
 */
export function publicActions() {
  return (client: Client.Client): publicActions.Decorator => ({
    getBlockNumber: (options) => getBlockNumber(client, options),
    getChainId: () => getChainId(client),
    getGasPrice: () => getGasPrice(client),
  })
}

export declare namespace publicActions {
  type Decorator = {
    getBlockNumber: (
      options?: getBlockNumber.Options | undefined,
    ) => Promise<getBlockNumber.ReturnType>
    getChainId: () => Promise<getChainId.ReturnType>
    getGasPrice: () => Promise<getGasPrice.ReturnType>
  }
}
