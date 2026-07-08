import type { Address, Errors } from 'ox'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import {
  type RequireCanonicalError,
  blockParameter,
} from '../internal/blockParameter.js'

/**
 * Returns the number of transactions an Account has broadcast / sent.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const count = await Actions.address.getTransactionCount(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 * ```
 */
export async function getTransactionCount(
  client: Client.Client,
  options: getTransactionCount.Options,
): Promise<getTransactionCount.ReturnType> {
  const {
    address,
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    requireCanonical,
  } = options
  const schema = z.RpcSchema.parseItem(
    z.RpcSchema.Eth,
    'eth_getTransactionCount',
  )
  const count = await client.request(
    {
      method: 'eth_getTransactionCount',
      params: z.RpcSchema.encodeParams(schema, [
        address,
        blockParameter({ blockHash, blockNumber, blockTag, requireCanonical }),
      ]),
    },
    { dedupe: typeof blockNumber === 'bigint' || blockHash !== undefined },
  )
  return z.RpcSchema.decodeReturns(schema, count)
}

export declare namespace getTransactionCount {
  type Options = {
    /** The Account address. */
    address: Address.Address
  } & blockParameter.BlockOptions

  type ReturnType = number

  type ErrorType = RequireCanonicalError | Errors.GlobalErrorType
}
