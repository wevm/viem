import type { SmartAccount } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  DeriveSmartAccount,
  GetSmartAccountParameter,
} from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { BundlerRpcSchema } from '../../types/eip1193.js'
import type {
  DeriveEntryPointVersion,
  EntryPointVersion,
} from '../../types/entryPointVersion.js'
import type { Hex } from '../../types/misc.js'
import type {
  UserOperation,
  UserOperationRequest,
} from '../../types/userOperation.js'
import type { UnionRequiredBy } from '../../types/utils.js'
import { getUserOperationError } from '../../utils/errors/getUserOperationError.js'
import { formatUserOperationRequest } from '../../utils/formatters/userOperationRequest.js'
import { getAction } from '../../utils/getAction.js'
import {
  type PrepareUserOperationParameters,
  prepareUserOperation,
} from './prepareUserOperation.js'

export type SendUserOperationParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  //
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = UnionRequiredBy<
  UserOperationRequest<_derivedVersion>,
  // @ts-ignore
  'maxFeePerGas' | 'maxPriorityFeePerGas'
> &
  GetSmartAccountParameter<account, accountOverride>

export type SendUserOperationReturnType = Hex

export type SendUserOperationErrorType = ErrorType

/**
 * Broadcasts a User Operation to the Bundler.
 *
 * - Docs: https://viem.sh/actions/bundler/sendUserOperation
 *
 * @param client - Client to use
 * @param parameters - {@link SendUserOperationParameters}
 * @returns The User Operation hash. {@link SendUserOperationReturnType}
 *
 * @example
 * import { createBundlerClient, http, parseEther, sendUserOperation } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { toSmartAccount } from 'viem/accounts'
 *
 * const account = await toSmartAccount({ ... })
 *
 * const bundlerClient = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const values = await sendUserOperation(bundlerClient, {
 *   account,
 *   calls: [{ to: '0x...', value: parseEther('1') }],
 * })
 */
export async function sendUserOperation<
  account extends SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, Chain | undefined, account, BundlerRpcSchema>,
  parameters: SendUserOperationParameters<account, accountOverride>,
) {
  const { account: account_ = client.account } = parameters

  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  const request = await getAction(
    client,
    prepareUserOperation,
    'prepareTransactionRequest',
  )(parameters as unknown as PrepareUserOperationParameters)

  const signature = await account.signUserOperation({
    userOperation: request as UserOperation,
  })

  const rpcParameters = formatUserOperationRequest({
    ...request,
    signature,
  } as UserOperation)

  try {
    return await client.request({
      method: 'eth_sendUserOperation',
      params: [rpcParameters, account.entryPoint.address],
    })
  } catch (error) {
    throw getUserOperationError(error as BaseError, request as UserOperation)
  }
}
