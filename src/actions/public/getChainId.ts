import * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Transport from '../../core/Transport.js'

/**
 * Returns the chain ID associated with the current network.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const chainId = await actions.public.getChainId(client)
 * // @log: 1n
 * ```
 *
 * @param client - Client to use.
 * @returns Chain ID.
 */
export async function getChainId<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic | undefined = undefined,
  extended extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
>(
  client: Client.Client<chain, account, transport, schema, extended>,
): getChainId.ReturnType {
  const chainId = await client.request(
    {
      method: 'eth_chainId',
    },
    { dedupe: true },
  )
  return Hex.toBigInt(chainId as Hex.Hex)
}

export declare namespace getChainId {
  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
