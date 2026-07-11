import type { Address, Errors } from 'ox'
import type { RpcSchema } from 'ox/erc4337'

import type * as Client from '../../../core/Client.js'
import type * as Transport from '../../../core/Transport.js'

/**
 * Returns the EntryPoints supported by a Bundler.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/account-abstraction'
 *
 * const client = Client.create({ transport: http() })
 * const entryPoints = await Actions.entryPoint.getSupported(client)
 * ```
 */
export async function getSupported(
  client: Pick<Client.Client, 'request'>,
): Promise<getSupported.ReturnType> {
  const request = client.request as Transport.RequestFn<RpcSchema.Bundler>
  return request({ method: 'eth_supportedEntryPoints' })
}

export declare namespace getSupported {
  type ReturnType = readonly Address.Address[]

  type ErrorType = Errors.GlobalErrorType
}
