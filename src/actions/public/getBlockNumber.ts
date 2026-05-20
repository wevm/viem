import * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Transport from '../../core/Transport.js'
import { withCache } from '../../core/internal/promise.js'

const cacheKey = (uid: string) => `blockNumber.${uid}`

/**
 * Returns the number of the most recent block.
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
 * const blockNumber = await actions.public.getBlockNumber(client)
 * // @log: 69420n
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Block number.
 */
export async function getBlockNumber<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic | undefined = undefined,
  extended extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
>(
  client: Client.Client<chain, account, transport, schema, extended>,
  options: getBlockNumber.Options = {},
): getBlockNumber.ReturnType {
  const cacheTime = options.cacheTime ?? client.cacheTime
  const blockNumber = await withCache(
    () =>
      client.request({
        method: 'eth_blockNumber',
      }),
    { cacheKey: cacheKey(client.uid), cacheTime },
  )
  return Hex.toBigInt(blockNumber as Hex.Hex)
}

export declare namespace getBlockNumber {
  type Options = {
    /** Time in milliseconds that cached block number remains in memory. */
    cacheTime?: number | undefined
  }

  type ReturnType = Promise<bigint>

  type ErrorType = Hex.toBigInt.ErrorType
}
