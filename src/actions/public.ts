import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import { getBlockNumber } from './public/getBlockNumber.js'
import { getChainId } from './public/getChainId.js'

/**
 * Creates a public action decorator.
 *
 * @returns Client decorator.
 */
function decorator() {
  return <
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    transport extends Transport.Transport = Transport.Transport,
    schema extends RpcSchema.Generic | undefined = undefined,
    extended extends Record<string, unknown> | undefined =
      | Record<string, unknown>
      | undefined,
  >(
    client: Client.Client<chain, account, transport, schema, extended>,
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
