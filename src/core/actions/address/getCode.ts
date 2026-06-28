import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import {
  type RequireCanonicalError,
  blockParameter,
} from '../internal/blockParameter.js'

/**
 * Retrieves the bytecode at an address.
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
 * const code = await Actions.address.getCode(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 * })
 * ```
 */
export async function getCode(
  client: Client.Client,
  options: getCode.Options,
): Promise<getCode.ReturnType> {
  const {
    address,
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    requireCanonical,
  } = options
  const hex = await client.request(
    {
      method: 'eth_getCode',
      params: z.RpcSchema.encodeParams(z.RpcSchema.Eth, 'eth_getCode', [
        address,
        blockParameter({ blockHash, blockNumber, blockTag, requireCanonical }),
      ]),
    },
    { dedupe: typeof blockNumber === 'bigint' || blockHash !== undefined },
  )
  if (hex === '0x') return undefined
  return hex
}

export declare namespace getCode {
  type Options = {
    /** The contract address. */
    address: Address.Address
  } & blockParameter.BlockOptions

  type ReturnType = Hex.Hex | undefined

  type ErrorType = RequireCanonicalError | Errors.GlobalErrorType
}
