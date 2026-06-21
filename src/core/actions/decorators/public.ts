import type * as Block from 'ox/Block'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { call } from '../public/call.js'
import { getBalance } from '../public/getBalance.js'
import { getBlobBaseFee } from '../public/getBlobBaseFee.js'
import { getBlock } from '../public/getBlock.js'
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
  return <chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ): publicActions.Decorator<chain> => ({
    call: (options) => call(client, options),
    getBalance: (options) => getBalance(client, options),
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlock: (options) => getBlock(client, options),
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
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = {
    call: (options?: call.Options | undefined) => Promise<call.ReturnType>
    getBalance: (options: getBalance.Options) => Promise<getBalance.ReturnType>
    getBlobBaseFee: () => Promise<getBlobBaseFee.ReturnType>
    getBlock: <
      includeTransactions extends boolean = false,
      blockTag extends Block.Tag = 'latest',
    >(
      options?: getBlock.Options<includeTransactions, blockTag> | undefined,
    ) => Promise<getBlock.ReturnType<chain, includeTransactions, blockTag>>
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
