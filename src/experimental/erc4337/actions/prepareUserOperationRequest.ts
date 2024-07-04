import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import { parseAccount } from '../../../utils/index.js'
import type { BundlerRpcSchema } from '../types/eip1193.js'
import type {
  DeriveEntryPointVersion,
  EntryPointVersion,
  GetEntryPointVersionParameter,
} from '../types/entryPointVersion.js'
import type { UserOperationRequest } from '../types/userOperation.js'

export const defaultParameters = ['fees', 'gas', 'nonce', 'signature'] as const

export type PrepareUserOperationRequestParameterType =
  | 'fees'
  | 'gas'
  | 'nonce'
  | 'signature'

export type PrepareUserOperationRequestRequest<
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  ///
  _derivedVersion extends EntryPointVersion = DeriveEntryPointVersion<
    entryPointVersion,
    entryPointVersionOverride
  >,
> = UserOperationRequest<_derivedVersion> & {
  parameters?: readonly PrepareUserOperationRequestParameterType[] | undefined
}

export type PrepareUserOperationRequestParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  request extends PrepareUserOperationRequestRequest<
    entryPointVersion,
    entryPointVersionOverride
  > = PrepareUserOperationRequestRequest<
    entryPointVersion,
    entryPointVersionOverride
  >,
> = request &
  GetAccountParameter<account, accountOverride, false> &
  GetChainParameter<chain, chainOverride> &
  GetEntryPointVersionParameter<entryPointVersion, entryPointVersionOverride>

export type PrepareUserOperationRequestReturnType<
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  request extends PrepareUserOperationRequestRequest<
    entryPointVersion,
    entryPointVersionOverride
  > = PrepareUserOperationRequestRequest<
    entryPointVersion,
    entryPointVersionOverride
  >,
> = request

export async function prepareUserOperationRequest<
  chain extends Chain | undefined,
  account extends Account | undefined,
  entryPointVersion extends EntryPointVersion | undefined,
  const request extends PrepareUserOperationRequestRequest<
    entryPointVersion,
    entryPointVersionOverride
  >,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined = undefined,
>(
  client: Client<Transport, chain, account, BundlerRpcSchema> & {
    entryPointVersion?: entryPointVersion | undefined
  },
  parameters: PrepareUserOperationRequestParameters<
    chain,
    account,
    entryPointVersion,
    chainOverride,
    accountOverride,
    entryPointVersionOverride,
    request
  >,
): Promise<
  PrepareUserOperationRequestReturnType<
    entryPointVersion,
    entryPointVersionOverride,
    request
  >
> {
  const {
    account: account_ = client.account,
    parameters: parameters_ = defaultParameters,
    sender,
  } = parameters as PrepareUserOperationRequestParameters

  if (!account_ && !sender) throw new AccountNotFoundError()
  const account = parseAccount(account_! || sender!)

  if (account.type !== 'smart')
    throw new Error(
      `Account type "${account?.type}" is not supported. Expected: "smart".`,
    )

  const request = {
    ...parameters,
    ...(account ? { sender: account.address } : {}),
  } as PrepareUserOperationRequestRequest

  if (parameters_.includes('nonce'))
    request.nonce = (await account.getNonce()) ?? 0n

  if (parameters_.includes('signature'))
    // TODO: pass packed userop
    request.signature = await account.getFormattedSignature()

  delete request.parameters

  return request as any
}
