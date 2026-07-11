import { type Address, type Errors, Hex } from 'ox'
import type { RpcSchema } from 'ox/erc4337'

import type * as Client from '../../../core/Client.js'
import type * as Transport from '../../../core/Transport.js'
import type * as EntryPoint from '../../EntryPoint.js'
import * as UserOperation from '../../UserOperation.js'
import { UserOperationNotFoundError } from '../../errors.js'

/**
 * Returns a User Operation and its inclusion information for a given hash.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/account-abstraction'
 *
 * const client = Client.create({ transport: http() })
 * const userOperation = await Actions.userOperation.get(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function get<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(
  client: Pick<Client.Client, 'request'>,
  options: get.Options,
): Promise<get.ReturnType<entryPointVersion>> {
  const { hash } = options
  const request = client.request as Transport.RequestFn<
    RpcSchema.Bundler<entryPointVersion>
  >
  const result = await request(
    {
      method: 'eth_getUserOperationByHash',
      params: [hash],
    },
    { dedupe: true },
  )

  if (!result) throw new UserOperationNotFoundError({ hash })

  return {
    ...result,
    blockNumber:
      result.blockNumber === null ? null : Hex.toBigInt(result.blockNumber),
    userOperation: UserOperation.fromRpc(result.userOperation),
  } as get.ReturnType<entryPointVersion>
}

export declare namespace get {
  type Options = {
    /** Hash of the User Operation. */
    hash: Hex.Hex
  }

  type ReturnType<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = {
    /** Block hash containing the User Operation, or `null` while pending. */
    blockHash: Hex.Hex | null
    /** Block number containing the User Operation, or `null` while pending. */
    blockNumber: bigint | null
    /** EntryPoint handling the User Operation. */
    entryPoint: Address.Address
    /** Transaction hash containing the User Operation, or `null` while pending. */
    transactionHash: Hex.Hex | null
    /** User Operation returned by the Bundler. */
    userOperation: UserOperation.UserOperation<entryPointVersion, true>
  }

  type ErrorType =
    | UserOperationNotFoundError
    | UserOperation.fromRpc.ErrorType
    | Errors.GlobalErrorType
}
