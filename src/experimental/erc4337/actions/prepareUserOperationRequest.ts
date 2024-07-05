import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { Chain } from '../../../types/chain.js'
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
  | 'signature'

type FactoryProperties<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> =
  | (entryPointVersion extends '0.7'
      ? {
          factory: UserOperation['factory']
          factoryData: UserOperation['factoryData']
        }
      : never)
  | (entryPointVersion extends '0.6'
      ? {
          initCode: UserOperation['initCode']
        }
      : never)

type GasProperties<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> =
  | (entryPointVersion extends '0.7'
      ? {
          callGasLimit: UserOperation['callGasLimit']
          preVerificationGas: UserOperation['preVerificationGas']
          verificationGasLimit: UserOperation['verificationGasLimit']
          paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
          paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
        }
      : never)
  | (entryPointVersion extends '0.6'
      ? {
          callGasLimit: UserOperation['callGasLimit']
          preVerificationGas: UserOperation['preVerificationGas']
          verificationGasLimit: UserOperation['verificationGasLimit']
        }
      : never)

type NonceProperties = {
  nonce: UserOperation['nonce']
}

type SignatureProperties = {
  signature: UserOperation['signature']
}

export type PrepareUserOperationRequestRequest<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  //
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
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  request extends PrepareUserOperationRequestRequest<
    account,
    accountOverride
  > = PrepareUserOperationRequestRequest<account, accountOverride>,
> = request & GetSmartAccountParameter<account, accountOverride>

export type PrepareUserOperationRequestReturnType<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  request extends PrepareUserOperationRequestRequest<
    account,
    accountOverride
  > = PrepareUserOperationRequestRequest<account, accountOverride>,
  //
  _parameters extends
    PrepareUserOperationRequestParameterType = request['parameters'] extends readonly PrepareUserOperationRequestParameterType[]
    ? request['parameters'][number]
    : (typeof defaultParameters)[number],
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = Prettify<
  Assign<
    UnionOmit<request, 'calls' | 'parameters'>,
    {
      callData: Hex
      sender: UserOperation['sender']
    } & (Extract<_parameters, 'factory'> extends 'factory'
      ? FactoryProperties<_derivedVersion>
      : {}) &
      (Extract<_parameters, 'nonce'> extends 'nonce' ? NonceProperties : {}) &
      (Extract<_parameters, 'gas'> extends 'gas'
        ? GasProperties<_derivedVersion>
        : {}) &
      (Extract<_parameters, 'signature'> extends 'signature'
        ? SignatureProperties
        : {})
  >
>

/**
 * Prepares a User Operation and fills in missing properties.
 *
 * - Docs: https://viem.sh/experimental/erc4337/prepareUserOperationRequest
 *
 * @param args - {@link PrepareUserOperationRequestParameters}
 * @returns The User Operation. {@link PrepareUserOperationRequestReturnType}
 *
 * @example
 * import { createBundlerClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { prepareUserOperationRequest, toSmartAccount } from 'viem/experimental'
 *
 * const account = await toSmartAccount({ ... })
 *
 * const client = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const request = await prepareUserOperationRequest(client, {
 *   account,
 *   calls: [{ to: '0x...', value: parseEther('1') }],
 * })
 */
export async function prepareUserOperationRequest<
  account extends SmartAccount | undefined,
  const request extends PrepareUserOperationRequestRequest<
    account,
    accountOverride
  >,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, Chain | undefined, account, BundlerRpcSchema>,
  parameters: PrepareUserOperationRequestParameters<
    account,
    accountOverride,
    request
  >,
): Promise<
  PrepareUserOperationRequestReturnType<account, accountOverride, request>
> {
  const {
    account: account_ = client.account,
    parameters: parameters_ = defaultParameters,
  } = parameters as PrepareUserOperationRequestParameters

  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  let request = {
    ...parameters,
    ...(account ? { sender: account.address } : {}),
  } as PrepareUserOperationRequestRequest

  const [callData, factory, nonce, gas, signature] = await Promise.all([
    (async () => {
      if (request.calls) return account.getCallData(request.calls)
      return request.callData
    })(),
    (async () => {
      if (!parameters_.includes('factory')) return undefined
      if (request.initCode) return { initCode: request.initCode }
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
    (async () => {
      if (!parameters_.includes('signature')) return undefined
      return account.formatSignature()
    })(),
  ])

  if (typeof callData !== 'undefined') request.callData = callData
  if (typeof factory !== 'undefined')
    request = { ...request, ...(factory as any) }
  if (typeof nonce !== 'undefined') request.nonce = nonce
  if (typeof gas !== 'undefined') request = { ...request, ...(gas as any) }
  if (typeof signature !== 'undefined') request.signature = signature

  delete request.calls
  delete request.parameters

  return request as any
}
