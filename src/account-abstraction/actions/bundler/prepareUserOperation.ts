import type { Address, Narrow } from 'abitype'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../../accounts/utils/parseAccount.js'
import { prepareAuthorization } from '../../../actions/index.js'
import {
  type EstimateFeesPerGasErrorType,
  estimateFeesPerGas,
} from '../../../actions/public/estimateFeesPerGas.js'
import { getChainId as getChainId_ } from '../../../actions/public/getChainId.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { SignedAuthorization } from '../../../types/authorization.js'
import type { Call, Calls } from '../../../types/calls.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { StateOverride } from '../../../types/stateOverride.js'
import type {
  Assign,
  OneOf,
  Prettify,
  UnionOmit,
} from '../../../types/utils.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { type ConcatErrorType, concat } from '../../../utils/data/concat.js'
import { getAction } from '../../../utils/getAction.js'
import type { SmartAccount } from '../../accounts/types.js'
import type { BundlerClient } from '../../clients/createBundlerClient.js'
import type { PaymasterActions } from '../../clients/decorators/paymaster.js'
import type {
  DeriveSmartAccount,
  GetSmartAccountParameter,
} from '../../types/account.js'
import type {
  DeriveEntryPointVersion,
  EntryPointVersion,
} from '../../types/entryPointVersion.js'
import type {
  UserOperation,
  UserOperationRequest,
} from '../../types/userOperation.js'
import {
  type GetPaymasterDataErrorType,
  getPaymasterData as getPaymasterData_,
} from '../paymaster/getPaymasterData.js'
import {
  type GetPaymasterStubDataErrorType,
  getPaymasterStubData as getPaymasterStubData_,
} from '../paymaster/getPaymasterStubData.js'
import {
  type EstimateUserOperationGasParameters,
  estimateUserOperationGas,
} from './estimateUserOperationGas.js'

const defaultParameters = [
  'factory',
  'fees',
  'gas',
  'paymaster',
  'nonce',
  'signature',
  'authorization',
] as const

export type PrepareUserOperationParameterType =
  | 'factory'
  | 'fees'
  | 'gas'
  | 'paymaster'
  | 'nonce'
  | 'signature'
  | 'authorization'

type FactoryProperties<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> =
  | (entryPointVersion extends '0.9'
      ? {
          factory: UserOperation['factory']
          factoryData: UserOperation['factoryData']
        }
      : never)
  | (entryPointVersion extends '0.8'
      ? {
          factory: UserOperation['factory']
          factoryData: UserOperation['factoryData']
        }
      : never)
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
  | (entryPointVersion extends '0.9'
      ? {
          callGasLimit: UserOperation['callGasLimit']
          preVerificationGas: UserOperation['preVerificationGas']
          verificationGasLimit: UserOperation['verificationGasLimit']
          paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
          paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
        }
      : never)
  | (entryPointVersion extends '0.8'
      ? {
          callGasLimit: UserOperation['callGasLimit']
          preVerificationGas: UserOperation['preVerificationGas']
          verificationGasLimit: UserOperation['verificationGasLimit']
          paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
          paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
        }
      : never)
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

type FeeProperties = {
  maxFeePerGas: UserOperation['maxFeePerGas']
  maxPriorityFeePerGas: UserOperation['maxPriorityFeePerGas']
}

type NonceProperties = {
  nonce: UserOperation['nonce']
}

type PaymasterProperties<
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> =
  | (entryPointVersion extends '0.9'
      ? {
          paymaster: UserOperation['paymaster']
          paymasterData: UserOperation['paymasterData']
          paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
          paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
        }
      : never)
  | (entryPointVersion extends '0.8'
      ? {
          paymaster: UserOperation['paymaster']
          paymasterData: UserOperation['paymasterData']
          paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
          paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
        }
      : never)
  | (entryPointVersion extends '0.7'
      ? {
          paymaster: UserOperation['paymaster']
          paymasterData: UserOperation['paymasterData']
          paymasterPostOpGasLimit: UserOperation['paymasterPostOpGasLimit']
          paymasterVerificationGasLimit: UserOperation['paymasterVerificationGasLimit']
        }
      : never)
  | (entryPointVersion extends '0.6'
      ? {
          paymasterAndData: UserOperation['paymasterAndData']
        }
      : never)

type SignatureProperties = {
  signature: UserOperation['signature']
}

type AuthorizationProperties = {
  authorization: UserOperation['authorization']
}

export type PrepareUserOperationRequest<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  //
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = Assign<
  UserOperationRequest<_derivedVersion>,
  OneOf<{ calls: Calls<Narrow<calls>> } | { callData: Hex }> & {
    parameters?: readonly PrepareUserOperationParameterType[] | undefined
    paymaster?:
      | Address
      | true
      | {
          /** Retrieves paymaster-related User Operation properties to be used for sending the User Operation. */
          getPaymasterData?: PaymasterActions['getPaymasterData'] | undefined
          /** Retrieves paymaster-related User Operation properties to be used for gas estimation. */
          getPaymasterStubData?:
            | PaymasterActions['getPaymasterStubData']
            | undefined
        }
      | undefined
    /** Paymaster context to pass to `getPaymasterData` and `getPaymasterStubData` calls. */
    paymasterContext?: unknown | undefined
    /** State overrides for the User Operation call. */
    stateOverride?: StateOverride | undefined
  }
>

export type PrepareUserOperationParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  request extends PrepareUserOperationRequest<
    account,
    accountOverride,
    calls
  > = PrepareUserOperationRequest<account, accountOverride, calls>,
> = request & GetSmartAccountParameter<account, accountOverride>

export type PrepareUserOperationReturnType<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  request extends PrepareUserOperationRequest<
    account,
    accountOverride,
    calls
  > = PrepareUserOperationRequest<account, accountOverride, calls>,
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
  } & (Extract<_parameters, 'authorization'> extends never
      ? {}
      : AuthorizationProperties) &
    (Extract<_parameters, 'factory'> extends never
      ? {}
      : FactoryProperties<_derivedVersion>) &
    (Extract<_parameters, 'nonce'> extends never ? {} : NonceProperties) &
    (Extract<_parameters, 'fees'> extends never ? {} : FeeProperties) &
    (Extract<_parameters, 'gas'> extends never
      ? {}
      : GasProperties<_derivedVersion>) &
    (Extract<_parameters, 'paymaster'> extends never
      ? {}
      : PaymasterProperties<_derivedVersion>) &
    (Extract<_parameters, 'signature'> extends never ? {} : SignatureProperties)
>

export type PrepareUserOperationErrorType =
  | ParseAccountErrorType
  | GetPaymasterStubDataErrorType
  | GetPaymasterDataErrorType
  | EncodeFunctionDataErrorType
  | ConcatErrorType
  | EstimateFeesPerGasErrorType
  | ErrorType

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
  const calls extends readonly unknown[],
  const request extends PrepareUserOperationRequest<
    account,
    accountOverride,
    calls
  >,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, Chain | undefined, account>,
  parameters_: PrepareUserOperationParameters<
    account,
    accountOverride,
    calls,
    request
  >,
): Promise<
  PrepareUserOperationReturnType<account, accountOverride, calls, request>
> {
  const parameters = parameters_ as PrepareUserOperationParameters
  const {
    account: account_ = client.account,
    parameters: properties = defaultParameters,
    stateOverride,
  } = parameters

  ////////////////////////////////////////////////////////////////////////////////
  // Assert that an Account is defined.
  ////////////////////////////////////////////////////////////////////////////////

  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  ////////////////////////////////////////////////////////////////////////////////
  // Declare typed Bundler Client.
  ////////////////////////////////////////////////////////////////////////////////

  const bundlerClient = client as unknown as BundlerClient

  ////////////////////////////////////////////////////////////////////////////////
  // Declare Paymaster properties.
  ////////////////////////////////////////////////////////////////////////////////

  const paymaster = parameters.paymaster ?? bundlerClient?.paymaster
  const paymasterAddress = typeof paymaster === 'string' ? paymaster : undefined
  const { getPaymasterStubData, getPaymasterData } = (() => {
    // If `paymaster: true`, we will assume the Bundler Client supports Paymaster Actions.
    if (paymaster === true)
      return {
        getPaymasterStubData: (parameters: any) =>
          getAction(
            bundlerClient,
            getPaymasterStubData_,
            'getPaymasterStubData',
          )(parameters),
        getPaymasterData: (parameters: any) =>
          getAction(
            bundlerClient,
            getPaymasterData_,
            'getPaymasterData',
          )(parameters),
      }

    // If Actions are passed to `paymaster` (via Paymaster Client or directly), we will use them.
    if (typeof paymaster === 'object') {
      const { getPaymasterStubData, getPaymasterData } = paymaster
      return {
        getPaymasterStubData: (getPaymasterData && getPaymasterStubData
          ? getPaymasterStubData
          : getPaymasterData) as typeof getPaymasterStubData,
        getPaymasterData:
          getPaymasterData && getPaymasterStubData
            ? getPaymasterData
            : undefined,
      }
    }

    // No Paymaster functions.
    return {
      getPaymasterStubData: undefined,
      getPaymasterData: undefined,
    }
  })()
  const paymasterContext = parameters.paymasterContext
    ? parameters.paymasterContext
    : bundlerClient?.paymasterContext

  ////////////////////////////////////////////////////////////////////////////////
  // Set up the User Operation request.
  ////////////////////////////////////////////////////////////////////////////////

  let request = {
    ...parameters,
    paymaster: paymasterAddress,
    sender: account.address,
  } as PrepareUserOperationRequest

  ////////////////////////////////////////////////////////////////////////////////
  // Concurrently prepare properties required to fill the User Operation.
  ////////////////////////////////////////////////////////////////////////////////

  const [callData, factory, fees, nonce, authorization] = await Promise.all([
    (async () => {
      if (parameters.calls)
        return account.encodeCalls(
          parameters.calls.map((call_) => {
            const call = call_ as Call
            if (call.abi)
              return {
                data: encodeFunctionData(call),
                to: call.to,
                value: call.value,
              } as Call
            return call as Call
          }),
        )
      return parameters.callData
    })(),
    (async () => {
      if (!properties.includes('factory')) return undefined
      if (parameters.initCode) return { initCode: parameters.initCode }
      if (parameters.factory && parameters.factoryData) {
        return {
          factory: parameters.factory,
          factoryData: parameters.factoryData,
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
      if (!properties.includes('fees')) return undefined

      // If we have sufficient properties for fees, return them.
      if (
        typeof parameters.maxFeePerGas === 'bigint' &&
        typeof parameters.maxPriorityFeePerGas === 'bigint'
      )
        return request

      // If the Bundler Client has a `estimateFeesPerGas` hook, run it.
      if (bundlerClient?.userOperation?.estimateFeesPerGas) {
        const fees = await bundlerClient.userOperation.estimateFeesPerGas({
          account,
          bundlerClient,
          userOperation: request as UserOperation,
        })
        return {
          ...request,
          ...fees,
        }
      }

      // Otherwise, we will need to estimate the fees to fill the fee properties.
      try {
        const client_ = bundlerClient.client ?? client
        const fees = await getAction(
          client_,
          estimateFeesPerGas,
          'estimateFeesPerGas',
        )({
          chain: client_.chain,
          type: 'eip1559',
        })
        return {
          maxFeePerGas:
            typeof parameters.maxFeePerGas === 'bigint'
              ? parameters.maxFeePerGas
              : BigInt(
                  // Bundlers unfortunately have strict rules on fee prechecks – we will need to set a generous buffer.
                  2n * fees.maxFeePerGas,
                ),
          maxPriorityFeePerGas:
            typeof parameters.maxPriorityFeePerGas === 'bigint'
              ? parameters.maxPriorityFeePerGas
              : BigInt(
                  // Bundlers unfortunately have strict rules on fee prechecks – we will need to set a generous buffer.
                  2n * fees.maxPriorityFeePerGas,
                ),
        }
      } catch {
        return undefined
      }
    })(),
    (async () => {
      if (!properties.includes('nonce')) return undefined
      if (typeof parameters.nonce === 'bigint') return parameters.nonce
      return account.getNonce()
    })(),
    (async () => {
      if (!properties.includes('authorization')) return undefined
      if (typeof parameters.authorization === 'object')
        return parameters.authorization
      if (account.authorization && !(await account.isDeployed())) {
        const authorization = await prepareAuthorization(
          account.client,
          account.authorization,
        )
        return {
          ...authorization,
          r: '0xfffffffffffffffffffffffffffffff000000000000000000000000000000000',
          s: '0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          yParity: 1,
        } satisfies SignedAuthorization
      }
      return undefined
    })(),
  ])

  ////////////////////////////////////////////////////////////////////////////////
  // Fill User Operation with the prepared properties from above.
  ////////////////////////////////////////////////////////////////////////////////

  if (typeof callData !== 'undefined') request.callData = callData
  if (typeof factory !== 'undefined')
    request = { ...request, ...(factory as any) }
  if (typeof fees !== 'undefined') request = { ...request, ...(fees as any) }
  if (typeof nonce !== 'undefined') request.nonce = nonce
  if (typeof authorization !== 'undefined')
    request.authorization = authorization

  ////////////////////////////////////////////////////////////////////////////////
  // Fill User Operation with the `signature` property.
  ////////////////////////////////////////////////////////////////////////////////

  if (properties.includes('signature')) {
    if (typeof parameters.signature !== 'undefined')
      request.signature = parameters.signature
    else
      request.signature = await account.getStubSignature(
        request as UserOperation,
      )
  }

  ////////////////////////////////////////////////////////////////////////////////
  // `initCode` is required to be filled with EntryPoint 0.6.
  ////////////////////////////////////////////////////////////////////////////////

  // If no `initCode` is provided, we use an empty bytes string.
  if (account.entryPoint.version === '0.6' && !request.initCode)
    request.initCode = '0x'

  ////////////////////////////////////////////////////////////////////////////////
  // Fill User Operation with paymaster-related properties for **gas estimation**.
  ////////////////////////////////////////////////////////////////////////////////

  let chainId: number | undefined
  async function getChainId(): Promise<number> {
    if (chainId) return chainId
    if (client.chain) return client.chain.id
    const chainId_ = await getAction(client, getChainId_, 'getChainId')({})
    chainId = chainId_
    return chainId
  }

  // If the User Operation is intended to be sponsored, we will need to fill the paymaster-related
  // User Operation properties required to estimate the User Operation gas.
  let isPaymasterPopulated = false
  if (
    properties.includes('paymaster') &&
    getPaymasterStubData &&
    !paymasterAddress &&
    !parameters.paymasterAndData
  ) {
    const {
      isFinal = false,
      sponsor: _,
      ...paymasterArgs
    } = await getPaymasterStubData({
      chainId: await getChainId(),
      entryPointAddress: account.entryPoint.address,
      context: paymasterContext,
      ...(request as UserOperation),
    })
    isPaymasterPopulated = isFinal
    request = {
      ...request,
      ...paymasterArgs,
    } as PrepareUserOperationRequest
  }

  ////////////////////////////////////////////////////////////////////////////////
  // `paymasterAndData` is required to be filled with EntryPoint 0.6.
  ////////////////////////////////////////////////////////////////////////////////

  // If no `paymasterAndData` is provided, we use an empty bytes string.
  if (account.entryPoint.version === '0.6' && !request.paymasterAndData)
    request.paymasterAndData = '0x'

  ////////////////////////////////////////////////////////////////////////////////
  // Fill User Operation with gas-related properties.
  ////////////////////////////////////////////////////////////////////////////////

  if (properties.includes('gas')) {
    // If the Account has opinionated gas estimation logic, run the `estimateGas` hook and
    // fill the request with the prepared gas properties.
    if (account.userOperation?.estimateGas) {
      const gas = await account.userOperation.estimateGas(
        request as UserOperation,
      )
      request = {
        ...request,
        ...gas,
      } as PrepareUserOperationRequest
    }

    // If not all the gas properties are already populated, we will need to estimate the gas
    // to fill the gas properties.
    if (
      typeof request.callGasLimit === 'undefined' ||
      typeof request.preVerificationGas === 'undefined' ||
      typeof request.verificationGasLimit === 'undefined' ||
      (request.paymaster &&
        typeof request.paymasterPostOpGasLimit === 'undefined') ||
      (request.paymaster &&
        typeof request.paymasterVerificationGasLimit === 'undefined')
    ) {
      const gas = await getAction(
        bundlerClient,
        estimateUserOperationGas,
        'estimateUserOperationGas',
      )({
        account,
        // Some Bundlers fail if nullish gas values are provided for gas estimation :') –
        // so we will need to set a default zeroish value.
        callGasLimit: 0n,
        preVerificationGas: 0n,
        verificationGasLimit: 0n,
        stateOverride,
        ...(request.paymaster
          ? {
              paymasterPostOpGasLimit: 0n,
              paymasterVerificationGasLimit: 0n,
            }
          : {}),
        ...request,
      } as EstimateUserOperationGasParameters)
      request = {
        ...request,
        callGasLimit: request.callGasLimit ?? gas.callGasLimit,
        preVerificationGas:
          request.preVerificationGas ?? gas.preVerificationGas,
        verificationGasLimit:
          request.verificationGasLimit ?? gas.verificationGasLimit,
        paymasterPostOpGasLimit:
          request.paymasterPostOpGasLimit ?? gas.paymasterPostOpGasLimit,
        paymasterVerificationGasLimit:
          request.paymasterVerificationGasLimit ??
          gas.paymasterVerificationGasLimit,
      } as PrepareUserOperationRequest
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Fill User Operation with paymaster-related properties for **sending** the User Operation.
  ////////////////////////////////////////////////////////////////////////////////

  // If the User Operation is intended to be sponsored, we will need to fill the paymaster-related
  // User Operation properties required to send the User Operation.
  if (
    properties.includes('paymaster') &&
    getPaymasterData &&
    !paymasterAddress &&
    !parameters.paymasterAndData &&
    !isPaymasterPopulated
  ) {
    // Retrieve paymaster-related User Operation properties to be used for **sending** the User Operation.
    const paymaster = await getPaymasterData({
      chainId: await getChainId(),
      entryPointAddress: account.entryPoint.address,
      context: paymasterContext,
      ...(request as UserOperation),
    })
    request = {
      ...request,
      ...paymaster,
    } as PrepareUserOperationRequest
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Remove redundant properties that do not conform to the User Operation schema.
  ////////////////////////////////////////////////////////////////////////////////

  delete request.calls
  delete request.parameters
  delete request.paymasterContext
  if (typeof request.paymaster !== 'string') delete request.paymaster

  ////////////////////////////////////////////////////////////////////////////////

  return request as unknown as PrepareUserOperationReturnType<
    account,
    accountOverride,
    calls,
    request
  >
}
