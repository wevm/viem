import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import type * as Block from '../utils/Block.js'
import { getBalance } from './public/getBalance.js'
import { getBlobBaseFee } from './public/getBlobBaseFee.js'
import { getBlock } from './public/getBlock.js'
import { getBlockNumber } from './public/getBlockNumber.js'
import { getBlockTransactionCount } from './public/getBlockTransactionCount.js'
import { getChainId } from './public/getChainId.js'
import { getCode } from './public/getCode.js'
import { getGasPrice } from './public/getGasPrice.js'
import { getStorageAt } from './public/getStorageAt.js'
import { getTransactionCount } from './public/getTransactionCount.js'

/** Public action methods attached by `publicActions`. */
export type PublicActions = {
  /**
   * Returns the balance of an address in wei.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const balance = await client.public.getBalance({
   *   address: '0x0000000000000000000000000000000000000000',
   * })
   * ```
   *
   * @param options - Options.
   * @returns Balance in wei.
   */
  getBalance: (options: getBalance.Options) => getBalance.ReturnType
  /**
   * Returns the current blob base fee.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const blobBaseFee = await client.public.getBlobBaseFee()
   * ```
   *
   * @returns Blob base fee.
   */
  getBlobBaseFee: () => getBlobBaseFee.ReturnType
  /**
   * Returns information about a block at a block number, hash, or tag.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const block = await client.public.getBlock()
   * ```
   *
   * @param options - Options.
   * @returns Block.
   */
  getBlock: <
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  >(
    options?: getBlock.Options<includeTransactions, blockTag> | undefined,
  ) => getBlock.ReturnType<includeTransactions, blockTag>
  /**
   * Returns the number of the most recent block.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const blockNumber = await client.public.getBlockNumber()
   * ```
   *
   * @param options - Options.
   * @returns Block number.
   */
  getBlockNumber: (
    options?: getBlockNumber.Options | undefined,
  ) => getBlockNumber.ReturnType
  /**
   * Returns the number of transactions in a block.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const count = await client.public.getBlockTransactionCount()
   * ```
   *
   * @param options - Options.
   * @returns Block transaction count.
   */
  getBlockTransactionCount: (
    options?: getBlockTransactionCount.Options | undefined,
  ) => getBlockTransactionCount.ReturnType
  /**
   * Returns the client chain ID.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const chainId = await client.public.getChainId()
   * ```
   *
   * @returns Chain ID.
   */
  getChainId: () => getChainId.ReturnType
  /**
   * Returns the bytecode at an address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const code = await client.public.getCode({
   *   address: '0x0000000000000000000000000000000000000000',
   * })
   * ```
   *
   * @param options - Options.
   * @returns Bytecode, if found.
   */
  getCode: (options: getCode.Options) => getCode.ReturnType
  /**
   * Returns the current gas price.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const gasPrice = await client.public.getGasPrice()
   * ```
   *
   * @returns Gas price.
   */
  getGasPrice: () => getGasPrice.ReturnType
  /**
   * Returns the value from a storage slot at an address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const value = await client.public.getStorageAt({
   *   address: '0x0000000000000000000000000000000000000000',
   *   slot: '0x0',
   * })
   * ```
   *
   * @param options - Options.
   * @returns Storage value.
   */
  getStorageAt: (options: getStorageAt.Options) => getStorageAt.ReturnType
  /**
   * Returns the number of transactions sent from an address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http } from 'viem'
   * import * as actions from 'viem/actions'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(actions.publicActions())
   *
   * const count = await client.public.getTransactionCount({
   *   address: '0x0000000000000000000000000000000000000000',
   * })
   * ```
   *
   * @param options - Options.
   * @returns Transaction count.
   */
  getTransactionCount: (
    options: getTransactionCount.Options,
  ) => getTransactionCount.ReturnType
}

/**
 * Creates a public action decorator.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({ transport: http() })
 *   .extend(actions.publicActions())
 *
 * const blockNumber = await client.public.getBlockNumber()
 * ```
 *
 * @returns Client decorator.
 */
export function publicActions() {
  return <
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    transport extends Transport.Transport = Transport.Transport,
    schema extends RpcSchema.Generic | undefined = undefined,
  >(
    client: Client.Client<chain, account, transport, schema>,
  ) => {
    const actionClient = client as unknown as Client.Client<chain>
    const actions: PublicActions = {
      getBalance: (options: getBalance.Options) =>
        getBalance(actionClient, options),
      getBlobBaseFee: () => getBlobBaseFee(actionClient),
      getBlock: <
        includeTransactions extends boolean = false,
        blockTag extends Block.Tag = 'latest',
      >(
        options?: getBlock.Options<includeTransactions, blockTag> | undefined,
      ) => getBlock(actionClient, options),
      getBlockNumber: (options?: getBlockNumber.Options | undefined) =>
        getBlockNumber(actionClient, options),
      getBlockTransactionCount: (
        options?: getBlockTransactionCount.Options | undefined,
      ) => getBlockTransactionCount(actionClient, options),
      getChainId: () => getChainId(actionClient),
      getCode: (options: getCode.Options) => getCode(actionClient, options),
      getGasPrice: () => getGasPrice(actionClient),
      getStorageAt: (options: getStorageAt.Options) =>
        getStorageAt(actionClient, options),
      getTransactionCount: (options: getTransactionCount.Options) =>
        getTransactionCount(actionClient, options),
    }

    return { public: actions }
  }
}

export {
  getBalance,
  getBlobBaseFee,
  getBlock,
  getBlockNumber,
  getBlockTransactionCount,
  getChainId,
  getCode,
  getGasPrice,
  getStorageAt,
  getTransactionCount,
}
