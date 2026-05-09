import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hash } from '../../../types/misc.js'
import type { Prettify } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import {
  UserOperationReceiptNotFoundError,
  type UserOperationReceiptNotFoundErrorType,
} from '../../errors/userOperation.js'
import type { UserOperationReceipt } from '../../types/userOperation.js'
import { formatUserOperationReceipt } from '../../utils/formatters/userOperationReceipt.js'

export type GetUserOperationReceiptParameters = {
  /** The hash of the User Operation. */
  hash: Hash
}

export type GetUserOperationReceiptReturnType = Prettify<UserOperationReceipt>

export type GetUserOperationReceiptErrorType =
  | RequestErrorType
  | UserOperationReceiptNotFoundErrorType
  | ErrorType

/**
 * Returns the User Operation Receipt given a User Operation hash.
 *
 * - Docs: https://viem.sh/docs/actions/bundler/getUserOperationReceipt
 *
 * @param client - Client to use
 * @param parameters - {@link GetUserOperationReceiptParameters}
 * @returns The receipt. {@link GetUserOperationReceiptReturnType}
 *
 * @example
 * import { createBundlerClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getUserOperationReceipt } from 'viem/actions
 *
 * const client = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const receipt = await getUserOperationReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export async function getUserOperationReceipt(
  client: Client<Transport>,
  { hash }: GetUserOperationReceiptParameters,
) {
  const receipt = await client.request(
    {
      method: 'eth_getUserOperationReceipt',
      params: [hash],
    },
    { dedupe: true },
  )

  if (!receipt) throw new UserOperationReceiptNotFoundError({ hash })

  return formatUserOperationReceipt(receipt)
}
