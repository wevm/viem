import type * as Client from '../core/Client.js'
import { getBlockNumber } from './public/getBlockNumber.js'
import { getChainId } from './public/getChainId.js'

/**
 * Creates a public action decorator.
 *
 * @returns Client decorator.
 */
function decorator() {
  return <client extends Client.Client>(client: client) => ({
    public: {
      getBlockNumber: (options?: getBlockNumber.Options | undefined) =>
        getBlockNumber(client, options),
      getChainId: () => getChainId(client),
    },
  })
}

/** Public action namespace and decorator. */
export const public_ = /*#__PURE__*/ Object.assign(decorator, {
  getBlockNumber,
  getChainId,
})
