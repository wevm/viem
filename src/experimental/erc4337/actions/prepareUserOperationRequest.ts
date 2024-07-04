import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { Assign, Prettify, UnionOmit } from '../../../types/utils.js'
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
import type {
  UserOperation,
  UserOperationRequest,
} from '../types/userOperation.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

export const defaultParameters = ['factory', 'gas', 'nonce'] as const

export type PrepareUserOperationRequestParameterType =
  | 'factory'
  | 'gas'
  | 'nonce'

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
  //
  parameters extends
    PrepareUserOperationRequestParameterType = request['parameters'] extends readonly PrepareUserOperationRequestParameterType[]
    ? request['parameters'][number]
    : (typeof defaultParameters)[number],
> = Prettify<
  Assign<
    UnionOmit<request, 'calls' | 'parameters'>,
    {
      callData: Hex
      sender: UserOperation['sender']
    } & (Extract<parameters, 'factory'> extends 'factory'
      ? {
          factory: UserOperation['factory']
          factoryData: UserOperation['factoryData']
        }
      : {}) &
      (Extract<parameters, 'nonce'> extends 'nonce'
        ? {
            nonce: UserOperation['nonce']
          }
        : {}) &
      (Extract<parameters, 'gas'> extends 'gas'
        ? {
            callGasLimit: UserOperation['callGasLimit']
            preVerificationGas: UserOperation['preVerificationGas']
            verificationGasLimit: UserOperation['verificationGasLimit']
            paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
            paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
          }
        : {})
  >
>

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

  const [callData, factory, nonce, gas] = await Promise.all([
    (async () => {
      if (request.calls) return account.getCallData(request.calls)
      return request.callData
    })(),
    (async () => {
      if (!parameters_.includes('factory')) return undefined
      if (request.factory && request.factoryData)
        return {
          factory: request.factory,
          factoryData: request.factoryData,
        }
      return account.getFactoryArgs()
    })(),
    (async () => {
      if (!parameters_.includes('nonce')) return undefined
      if (request.nonce) return request.nonce
      return account.getNonce()
    })(),
    (async () => {
      if (!parameters_.includes('gas')) return undefined
      return estimateUserOperationGas(client, {
        account,
        ...request,
      })
    })(),
  ])

  if (typeof callData !== 'undefined') request.callData = callData
  if (typeof factory !== 'undefined') {
    request.factory = factory.factory
    request.factoryData = factory.factoryData
  }
  if (typeof nonce !== 'undefined') request.nonce = nonce
  if (typeof gas !== 'undefined') {
    request.callGasLimit = gas.callGasLimit
    request.preVerificationGas = gas.preVerificationGas
    request.verificationGasLimit = gas.verificationGasLimit
    request.paymasterPostOpGasLimit = gas.paymasterPostOpGasLimit
    request.paymasterVerificationGasLimit = gas.paymasterVerificationGasLimit
  }

  delete request.calls
  delete request.parameters

  return request as any
}
