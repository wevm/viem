import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import { getBalance } from './public/getBalance.js'
import { getBlobBaseFee } from './public/getBlobBaseFee.js'
import { getBlockNumber } from './public/getBlockNumber.js'
import { getChainId } from './public/getChainId.js'
import { getCode } from './public/getCode.js'
import { getGasPrice } from './public/getGasPrice.js'
import { getStorageAt } from './public/getStorageAt.js'
import { getTransactionCount } from './public/getTransactionCount.js'

/**
 * Creates a public action decorator.
 *
 * @returns Client decorator.
 */
function decorator() {
  return <chain extends Chain.Chain | undefined = Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ) => ({
    public: {
      getBalance: (options: getBalance.Options) => getBalance(client, options),
      getBlobBaseFee: () => getBlobBaseFee(client),
      getBlockNumber: (options?: getBlockNumber.Options | undefined) =>
        getBlockNumber(client, options),
      getChainId: () => getChainId(client),
      getCode: (options: getCode.Options) => getCode(client, options),
      getGasPrice: () => getGasPrice(client),
      getStorageAt: (options: getStorageAt.Options) =>
        getStorageAt(client, options),
      getTransactionCount: (options: getTransactionCount.Options) =>
        getTransactionCount(client, options),
    },
  })
}

/** Public action namespace and decorator. */
export const publicActions = /*#__PURE__*/ Object.assign(decorator, {
  getBalance,
  getBlobBaseFee,
  getBlockNumber,
  getChainId,
  getCode,
  getGasPrice,
  getStorageAt,
  getTransactionCount,
})
