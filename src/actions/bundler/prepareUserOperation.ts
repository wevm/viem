import type { SmartAccount } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type {
  DeriveSmartAccount,
  GetSmartAccountParameter,
} from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type {
  DeriveEntryPointVersion,
  EntryPointVersion,
} from '../../types/entryPointVersion.js'
import type { Hex } from '../../types/misc.js'
import type {
  UserOperation,
  UserOperationRequest,
} from '../../types/userOperation.js'
import type { Prettify, UnionOmit } from '../../types/utils.js'
import { concat } from '../../utils/data/concat.js'
import { getAction } from '../../utils/getAction.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const defaultParameters = ['factory', 'gas', 'nonce'] as const

export type PrepareUserOperationParameterType =
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

export type PrepareUserOperationRequest<
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
  parameters?: readonly PrepareUserOperationParameterType[] | undefined
}

export type PrepareUserOperationParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  request extends PrepareUserOperationRequest<
    account,
    accountOverride
  > = PrepareUserOperationRequest<account, accountOverride>,
> = request & GetSmartAccountParameter<account, accountOverride>

export type PrepareUserOperationReturnType<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  request extends PrepareUserOperationRequest<
    account,
    accountOverride
  > = PrepareUserOperationRequest<account, accountOverride>,
  //
  _parameters extends
    PrepareUserOperationParameterType = request['parameters'] extends readonly PrepareUserOperationParameterType[]
    ? request['parameters'][number]
    : (typeof defaultParameters)[number],
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = Prettify<
  UnionOmit<request, 'calls' | 'parameters'> & {
    callData: Hex
    paymasterAndData: _derivedVersion extends '0.6' ? Hex : undefined
    sender: UserOperation['sender']
  } & (Extract<_parameters, 'factory'> extends never
      ? {}
      : FactoryProperties<_derivedVersion>) &
    (Extract<_parameters, 'nonce'> extends never ? {} : NonceProperties) &
    (Extract<_parameters, 'gas'> extends never
      ? {}
      : GasProperties<_derivedVersion>) &
    (Extract<_parameters, 'signature'> extends never ? {} : SignatureProperties)
>

/**
 * Prepares a User Operation and fills in missing properties.
 *
 * - Docs: https://viem.sh/actions/bundler/prepareUserOperation
 *
 * @param args - {@link PrepareUserOperationParameters}
 * @returns The User Operation. {@link PrepareUserOperationReturnType}
 *
 * @example
 * import { createBundlerClient, http } from 'viem'
 * import { toSmartAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { prepareUserOperation } from 'viem/actions'
 *
 * const account = await toSmartAccount({ ... })
 *
 * const client = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const request = await prepareUserOperation(client, {
 *   account,
 *   calls: [{ to: '0x...', value: parseEther('1') }],
 * })
 */
export async function prepareUserOperation<
  account extends SmartAccount | undefined,
  const request extends PrepareUserOperationRequest<account, accountOverride>,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, Chain | undefined, account>,
  parameters: PrepareUserOperationParameters<account, accountOverride, request>,
): Promise<PrepareUserOperationReturnType<account, accountOverride, request>> {
  const {
    account: account_ = client.account,
    parameters: parameters_ = defaultParameters,
  } = parameters as PrepareUserOperationParameters

  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  let request = {
    ...parameters,
    sender: account.address,
  } as PrepareUserOperationRequest

  // Concurrently prepare properties required to fill the User Operation.
  const [callData, factory, nonce, signature] = await Promise.all([
    (async () => {
      if (request.calls) return account.encodeCalls(request.calls)
      return request.callData
    })(),
    (async () => {
      if (!parameters_.includes('factory')) return undefined
      if (request.initCode) return { initCode: request.initCode }
      if (request.factory && request.factoryData) {
        return {
          factory: request.factory,
          factoryData: request.factoryData,
        }
      }

      const { factory, factoryData } = await account.getFactoryArgs()

      if (account.entryPoint.version === '0.6')
        return {
          initCode:
            factory && factoryData ? concat([factory, factoryData]) : undefined,
        }
      return {
        factory,
        factoryData,
      }
    })(),
    (async () => {
      if (!parameters_.includes('nonce')) return undefined
      if (typeof request.nonce === 'bigint') return request.nonce
      return account.getNonce()
    })(),
    (async () => {
      if (!parameters_.includes('signature')) return undefined
      return account.getSignature()
    })(),
  ])

  // Fill in the User Operation with the prepared properties.
  if (typeof callData !== 'undefined') request.callData = callData
  if (typeof factory !== 'undefined')
    request = { ...request, ...(factory as any) }
  if (typeof nonce !== 'undefined') request.nonce = nonce
  if (typeof signature !== 'undefined') request.signature = signature

  // `paymasterAndData` is required to be filled with EntryPoint 0.6.
  // If no `paymasterAndData` is provided, we use an empty bytes string.
  if (account.entryPoint.version === '0.6' && !request.paymasterAndData)
    request.paymasterAndData = '0x'

  if (parameters_.includes('gas')) {
    const gas = await getAction(
      client,
      estimateUserOperationGas,
      'estimateUserOperationGas',
    )({
      account,
      ...request,
    })
    request = {
      ...request,
      ...(gas as any),
    }
  }

  // Remove redundant properties.
  delete request.calls
  delete request.parameters

  return request as any
}
