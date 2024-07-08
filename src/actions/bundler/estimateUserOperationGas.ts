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
import type {
  EstimateUserOperationGasReturnType as EstimateUserOperationGasReturnType_,
  UserOperation,
  UserOperationRequest,
} from '../../types/userOperation.js'
import { getUserOperationError } from '../../utils/errors/getUserOperationError.js'
import { formatUserOperationGas } from '../../utils/formatters/userOperationGas.js'
import { formatUserOperationRequest } from '../../utils/formatters/userOperationRequest.js'
import { getAction } from '../../utils/getAction.js'
import {
  type PrepareUserOperationRequestParameters,
  prepareUserOperationRequest,
} from './prepareUserOperationRequest.js'

export type EstimateUserOperationGasParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  //
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = UserOperationRequest<_derivedVersion> &
  GetSmartAccountParameter<account, accountOverride>

export type EstimateUserOperationGasReturnType<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  //
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = EstimateUserOperationGasReturnType_<_derivedVersion>

export type EstimateUserOperationGasErrorType = ErrorType

/**
 * Returns an estimate of gas values necessary to execute the User Operation.
 *
 * - Docs: https://viem.sh/actions/bundler/estimateUserOperationGas
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateUserOperationGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateUserOperationGasReturnType}
 *
 * @example
 * import { createBundlerClient, estimateUserOperationGas, http, parseEther } from 'viem'
 * import { toSmartAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 *
 * const account = await toSmartAccount({ ... })
 *
 * const bundlerClient = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const values = await estimateUserOperationGas(bundlerClient, {
 *   account,
 *   calls: [{ to: '0x...', value: parseEther('1') }],
 * })
 */
export async function estimateUserOperationGas<
  account extends SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, Chain | undefined, account, BundlerRpcSchema>,
  parameters: EstimateUserOperationGasParameters<account, accountOverride>,
): Promise<EstimateUserOperationGasReturnType<account, accountOverride>> {
  const { account: account_ = client.account } = parameters

  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  const request = await getAction(
    client,
    prepareUserOperationRequest,
    'prepareUserOperationRequest',
  )({
    ...parameters,
    parameters: ['factory', 'nonce', 'signature'],
  } as unknown as PrepareUserOperationRequestParameters)

  try {
    const result = await client.request({
      method: 'eth_estimateUserOperationGas',
      params: [
        formatUserOperationRequest(request as UserOperation),
        account.entryPoint.address,
      ],
    })
    return formatUserOperationGas(result) as EstimateUserOperationGasReturnType<
      account,
      accountOverride
    >
  } catch (error) {
    throw getUserOperationError(error as BaseError, request as UserOperation)
  }
}
