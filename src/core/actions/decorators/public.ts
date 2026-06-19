import type * as Client from '../../Client.js'
import { getBlobBaseFee } from '../public/getBlobBaseFee.js'
import { getBlockNumber } from '../public/getBlockNumber.js'
import { getBlockTransactionCount } from '../public/getBlockTransactionCount.js'
import { getChainId } from '../public/getChainId.js'
import { getCode } from '../public/getCode.js'
import { getGasPrice } from '../public/getGasPrice.js'
import { getStorageAt } from '../public/getStorageAt.js'
import { getTransactionCount } from '../public/getTransactionCount.js'

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
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlockNumber: (options) => getBlockNumber(client, options),
    getBlockTransactionCount: (options) =>
      getBlockTransactionCount(client, options),
    getChainId: () => getChainId(client),
    getCode: (options) => getCode(client, options),
    getGasPrice: () => getGasPrice(client),
    getStorageAt: (options) => getStorageAt(client, options),
    getTransactionCount: (options) => getTransactionCount(client, options),
  })
}

export declare namespace publicActions {
  type Decorator = {
    getBlobBaseFee: () => Promise<getBlobBaseFee.ReturnType>
    getBlockNumber: (
      options?: getBlockNumber.Options | undefined,
    ) => Promise<getBlockNumber.ReturnType>
    getBlockTransactionCount: (
      options?: getBlockTransactionCount.Options | undefined,
    ) => Promise<getBlockTransactionCount.ReturnType>
    getChainId: () => Promise<getChainId.ReturnType>
    getCode: (options: getCode.Options) => Promise<getCode.ReturnType>
    getGasPrice: () => Promise<getGasPrice.ReturnType>
    getStorageAt: (
      options: getStorageAt.Options,
    ) => Promise<getStorageAt.ReturnType>
    getTransactionCount: (
      options: getTransactionCount.Options,
    ) => Promise<getTransactionCount.ReturnType>
  }
}
