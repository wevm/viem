import type { Errors, Hex } from 'ox'
import type { RpcSchema } from 'ox/erc4337'

import type * as Client from '../../../core/Client.js'
import type * as Transport from '../../../core/Transport.js'
import type * as EntryPoint from '../../EntryPoint.js'
import * as UserOperationReceipt from '../../UserOperationReceipt.js'
import { UserOperationReceiptNotFoundError } from '../../errors.js'

/**
 * Returns a User Operation receipt for a given hash.
 *
 * @example
 * ```ts
 * import { Actions, BundlerClient, http } from 'viem/erc4337'
 *
 * const client = BundlerClient.create({ transport: http() })
 * const receipt = await Actions.userOperation.getReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function getReceipt<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(
  client: Pick<Client.Client, 'request'>,
  options: getReceipt.Options,
): Promise<getReceipt.ReturnType<entryPointVersion>> {
  const { hash } = options
  const request = client.request as Transport.RequestFn<
    RpcSchema.Bundler<entryPointVersion>
  >
  const receipt = await request(
    {
      method: 'eth_getUserOperationReceipt',
      params: [hash],
    },
    { dedupe: true },
  )

  if (!receipt) throw new UserOperationReceiptNotFoundError({ hash })

  return UserOperationReceipt.fromRpc(
    receipt,
  ) as getReceipt.ReturnType<entryPointVersion>
}

export declare namespace getReceipt {
  type Options = {
    /** Hash of the User Operation. */
    hash: Hex.Hex
  }

  type ReturnType<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = UserOperationReceipt.UserOperationReceipt<entryPointVersion>

  type ErrorType = UserOperationReceiptNotFoundError | Errors.GlobalErrorType
}
