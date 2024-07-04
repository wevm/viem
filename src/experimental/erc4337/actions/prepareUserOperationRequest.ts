import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import { parseAccount } from '../../../utils/index.js'
import type { SmartAccount } from '../accounts/types.js'
import type {
  DeriveSmartAccount,
  GetSmartAccountParameter,
} from '../types/account.js'
import type { BundlerRpcSchema } from '../types/eip1193.js'
import type {
  DeriveEntryPointVersion,
  EntryPointVersion,
} from '../types/entryPointVersion.js'
import type { UserOperationRequest } from '../types/userOperation.js'

export const defaultParameters = ['fees', 'gas', 'nonce', 'signature'] as const

export type PrepareUserOperationRequestParameterType =
  | 'fees'
  | 'gas'
  | 'nonce'
  | 'signature'

export type PrepareUserOperationRequestRequest<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  ///
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = UserOperationRequest<_derivedVersion> & {
  parameters?: readonly PrepareUserOperationRequestParameterType[] | undefined
}

export type PrepareUserOperationRequestParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  request extends PrepareUserOperationRequestRequest<
    account,
    accountOverride
  > = PrepareUserOperationRequestRequest<account, accountOverride>,
> = request &
  GetSmartAccountParameter<account, accountOverride, false> &
  GetChainParameter<chain, chainOverride>

export type PrepareUserOperationRequestReturnType<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  request extends PrepareUserOperationRequestRequest<
    account,
    accountOverride
  > = PrepareUserOperationRequestRequest<account, accountOverride>,
> = request

export async function prepareUserOperationRequest<
  chain extends Chain | undefined,
  account extends SmartAccount | undefined,
  const request extends PrepareUserOperationRequestRequest<
    account,
    accountOverride
  >,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, chain, account, BundlerRpcSchema>,
  parameters: PrepareUserOperationRequestParameters<
    chain,
    account,
    chainOverride,
    accountOverride,
    request
  >,
): Promise<
  PrepareUserOperationRequestReturnType<account, accountOverride, request>
> {
  const {
    account: account_ = client.account,
    parameters: parameters_ = defaultParameters,
    sender,
  } = parameters as PrepareUserOperationRequestParameters

  if (!account_ && !sender) throw new AccountNotFoundError()
  const account = parseAccount(account_! || sender!)

  const request = {
    ...parameters,
    ...(account ? { sender: account.address } : {}),
  } as PrepareUserOperationRequestRequest

  if (parameters_.includes('nonce'))
    request.nonce = (await account.getNonce()) ?? 0n

  if (parameters_.includes('signature'))
    // TODO: pass packed userop
    request.signature = await account.getSignature()

  delete request.parameters

  return request as any
}
