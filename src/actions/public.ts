import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import { getBlockNumber } from './public/getBlockNumber.js'
import { getChainId } from './public/getChainId.js'

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
