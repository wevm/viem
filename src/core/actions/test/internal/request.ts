import type * as Client from '../../../Client.js'

/**
 * Loosely-typed request fn for anvil/hardhat/ganache test methods. These use
 * dynamic, mode-prefixed method names (`` `${mode}_setBalance` ``, with
 * ganache's `evm_*`/`eth_*` exceptions) that are off the Client's default
 * `RpcSchema`, so this carries the single cast instead of scattering `as` casts
 * across every test action.
 *
 * @internal
 */
export function request(client: Client.Client) {
  return client.request as (parameters: {
    method: string
    params?: unknown
  }) => Promise<any>
}
