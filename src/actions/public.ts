import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
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
  /** Returns the balance of an address in wei. */
  getBalance: (options: getBalance.Options) => getBalance.ReturnType
  /** Returns the current blob base fee. */
  getBlobBaseFee: () => getBlobBaseFee.ReturnType
  /** Returns information about a block at a block number, hash, or tag. */
  getBlock: <
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  >(
    options?: getBlock.Options<includeTransactions, blockTag> | undefined,
  ) => getBlock.ReturnType<includeTransactions, blockTag>
  /** Returns the number of the most recent block. */
  getBlockNumber: (
    options?: getBlockNumber.Options | undefined,
  ) => getBlockNumber.ReturnType
  /** Returns the number of transactions in a block. */
  getBlockTransactionCount: (
    options?: getBlockTransactionCount.Options | undefined,
  ) => getBlockTransactionCount.ReturnType
  /** Returns the client chain ID. */
  getChainId: () => getChainId.ReturnType
  /** Returns the bytecode at an address. */
  getCode: (options: getCode.Options) => getCode.ReturnType
  /** Returns the current gas price. */
  getGasPrice: () => getGasPrice.ReturnType
  /** Returns the value from a storage slot at an address. */
  getStorageAt: (options: getStorageAt.Options) => getStorageAt.ReturnType
  /** Returns the number of transactions sent from an address. */
  getTransactionCount: (
    options: getTransactionCount.Options,
  ) => getTransactionCount.ReturnType
}

/**
 * Creates a public action decorator.
 *
 * @returns Client decorator.
 */
export function publicActions() {
  return <chain extends Chain.Chain | undefined = Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ) => {
    const actions: PublicActions = {
      getBalance: (options: getBalance.Options) => getBalance(client, options),
      getBlobBaseFee: () => getBlobBaseFee(client),
      getBlock: <
        includeTransactions extends boolean = false,
        blockTag extends Block.Tag = 'latest',
      >(
        options?: getBlock.Options<includeTransactions, blockTag> | undefined,
      ) => getBlock(client, options),
      getBlockNumber: (options?: getBlockNumber.Options | undefined) =>
        getBlockNumber(client, options),
      getBlockTransactionCount: (
        options?: getBlockTransactionCount.Options | undefined,
      ) => getBlockTransactionCount(client, options),
      getChainId: () => getChainId(client),
      getCode: (options: getCode.Options) => getCode(client, options),
      getGasPrice: () => getGasPrice(client),
      getStorageAt: (options: getStorageAt.Options) =>
        getStorageAt(client, options),
      getTransactionCount: (options: getTransactionCount.Options) =>
        getTransactionCount(client, options),
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
