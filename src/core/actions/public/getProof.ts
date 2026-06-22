import type * as AccountProof from 'ox/AccountProof'
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
 * Returns the account and storage values of the specified account, including
 * the Merkle proof (`eth_getProof`).
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
 * const proof = await Actions.getProof(client, {
 *   address: '0x4200000000000000000000000000000000000016',
 *   storageKeys: [
 *     '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
 *   ],
 * })
 * ```
 */
export async function getProof(
  client: Client.Client,
  options: getProof.Options,
): Promise<getProof.ReturnType> {
  const {
    address,
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    requireCanonical,
    storageKeys,
  } = options
  const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_getProof')
  const proof = await client.request({
    method: 'eth_getProof',
    params: z.RpcSchema.encodeParams(item, [
      address,
      [...storageKeys],
      blockParameter({ blockHash, blockNumber, blockTag, requireCanonical }),
    ]),
  })
  return z.RpcSchema.decodeReturns(item, proof)
}

export declare namespace getProof {
  type Options = {
    /** Account address. */
    address: Address.Address
    /** Array of storage keys that should be proofed and included. */
    storageKeys: readonly Hex.Hex[]
  } & blockParameter.BlockOptions

  type ReturnType = AccountProof.AccountProof

  type ErrorType = RequireCanonicalError | Errors.GlobalErrorType
}
