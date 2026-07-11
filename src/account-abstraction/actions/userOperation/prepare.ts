import { AbiFunction, Hex } from 'ox'
import type { Address, Authorization, Errors, StateOverrides } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as viem_Client from '../../../core/Client.js'
import { getId } from '../../../core/actions/chains/getId.js'
import { estimateFeesPerGas } from '../../../core/actions/fee/estimateFeesPerGas.js'
import type { Call } from '../../../core/actions/internal/calls.js'
import { prepareAuthorization } from '../../../core/actions/wallet/prepareAuthorization.js'
import type {
  Assign,
  DistributiveOmit,
  IsUndefined,
  NoInfer,
  OneOf,
  Prettify,
} from '../../../core/internal/types.js'
import type * as Client from '../../Client.js'
import type * as EntryPoint from '../../EntryPoint.js'
import type * as SmartAccount from '../../SmartAccount.js'
import type * as UserOperation from '../../UserOperation.js'
import type * as UserOperationGas from '../../UserOperationGas.js'
import { getData as getPaymasterData } from '../paymaster/getData.js'
import { getStubData as getPaymasterStubData } from '../paymaster/getStubData.js'
import { estimateGas } from './estimateGas.js'

/** Parameters filled by {@link prepare}. */
const defaultParameters = [
  'authorization',
  'factory',
  'fees',
  'gas',
  'nonce',
  'paymaster',
  'signature',
] as const

/**
 * Prepares a User Operation by filling missing account, factory, fee, gas,
 * nonce, paymaster, signature, and authorization fields.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/account-abstraction'
 *
 * const userOperation = await Actions.userOperation.prepare(client, {
 *   calls: [{ to: '0x0000000000000000000000000000000000000000' }],
 * })
 * ```
 */
export async function prepare<
  const calls extends readonly unknown[],
  chain extends Chain.Chain | undefined,
  account extends SmartAccount.SmartAccount | undefined,
  accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
  const options extends {
    parameters?: readonly prepare.Parameter[] | undefined
  } = prepare.Options<account, accountOverride, NoInfer<calls>>,
>(
  client: Client.Client<chain, account>,
  options_: { calls?: calls | undefined } & prepare.Options<
    account,
    accountOverride,
    NoInfer<calls>
  > &
    options,
): Promise<prepare.ReturnType<account, accountOverride, calls, options>> {
  const options = options_ as prepare.Options
  const {
    account: account_ = client.account,
    dataSuffix = client.dataSuffix,
    parameters = defaultParameters,
    stateOverride,
  } = options

  if (!account_) throw new Account.NotFoundError()
  const account = account_ as SmartAccount.SmartAccount

  const paymaster = options.paymaster ?? client.paymaster
  const paymasterAddress = typeof paymaster === 'string' ? paymaster : undefined
  const { getData, getStubData } = resolvePaymasterActions(client, paymaster)
  const paymasterContext = options.paymasterContext
    ? options.paymasterContext
    : client.paymasterContext

  let request = {
    ...options,
    paymaster: paymasterAddress,
    sender: account.address,
  } as InternalRequest

  const [callData, factory, fees, nonce, authorization] = await Promise.all([
    (async () => {
      if ('calls' in options && options.calls) {
        const calls = (options.calls as readonly Call[]).map((call) => {
          const data = call.abi
            ? AbiFunction.encodeData(
                AbiFunction.fromAbi(call.abi, call.functionName, {
                  args: call.args,
                }),
                call.args,
              )
            : call.data
          return { data, to: call.to, value: call.value }
        })
        return account.encodeCalls(calls)
      }
      return options.callData
    })(),
    (async () => {
      if (!parameters.includes('factory')) return undefined
      if (options.initCode) return { initCode: options.initCode }
      if (options.factory && options.factoryData)
        return {
          factory: options.factory,
          factoryData: options.factoryData,
        }

      const { factory, factoryData } = await account.getFactoryArgs()
      if (account.entryPoint.version === '0.6')
        return {
          initCode:
            factory && factoryData
              ? Hex.concat(factory, factoryData)
              : undefined,
        }
      return { factory, factoryData }
    })(),
    (async () => {
      if (!parameters.includes('fees')) return undefined
      if (
        typeof options.maxFeePerGas === 'bigint' &&
        typeof options.maxPriorityFeePerGas === 'bigint'
      )
        return request

      if (client.userOperation?.estimateFeesPerGas) {
        const fees = await client.userOperation.estimateFeesPerGas({
          account,
          bundlerClient: client as unknown as Client.Client,
          userOperation: request as Partial<UserOperation.UserOperation>,
        })
        return { ...request, ...fees }
      }

      try {
        const executionClient = client.client ?? client
        const fees = await estimateFeesPerGas(
          executionClient as viem_Client.Client,
          { chain: executionClient.chain, type: 'eip1559' },
        )
        return {
          maxFeePerGas:
            typeof options.maxFeePerGas === 'bigint'
              ? options.maxFeePerGas
              : 2n * fees.maxFeePerGas,
          maxPriorityFeePerGas:
            typeof options.maxPriorityFeePerGas === 'bigint'
              ? options.maxPriorityFeePerGas
              : 2n * fees.maxPriorityFeePerGas,
        }
      } catch {
        return undefined
      }
    })(),
    (async () => {
      if (!parameters.includes('nonce')) return undefined
      if (typeof options.nonce === 'bigint') return options.nonce
      return account.getNonce()
    })(),
    (async () => {
      if (!parameters.includes('authorization')) return undefined
      if (options.authorization) return options.authorization
      if (account.authorization && !(await account.isDeployed())) {
        const authorization = await prepareAuthorization(account.client, {
          ...account.authorization,
          account: account.authorization.account,
        })
        return {
          ...authorization,
          r: '0xfffffffffffffffffffffffffffffff000000000000000000000000000000000',
          s: '0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          yParity: 1,
        } satisfies Authorization.Signed
      }
      return undefined
    })(),
  ])

  if (callData !== undefined)
    request.callData = dataSuffix ? Hex.concat(callData, dataSuffix) : callData
  if (factory !== undefined) request = { ...request, ...factory }
  if (fees !== undefined) request = { ...request, ...fees }
  if (nonce !== undefined) request.nonce = nonce
  if (authorization !== undefined) request.authorization = authorization

  if (parameters.includes('signature'))
    request.signature =
      options.signature ??
      (await account.getStubSignature(
        // The hook intentionally receives the currently prepared subset.
        request as Partial<UserOperation.UserOperation>,
      ))

  if (account.entryPoint.version === '0.6' && !request.initCode)
    request.initCode = '0x'

  let chainId: number | undefined
  async function getChainId() {
    if (typeof chainId === 'number') return chainId
    chainId =
      client.chain?.id ?? (await getId(client as unknown as viem_Client.Client))
    return chainId
  }

  let isPaymasterPopulated = false
  if (
    parameters.includes('paymaster') &&
    getStubData &&
    !paymasterAddress &&
    !options.paymasterAndData
  ) {
    const {
      isFinal = false,
      sponsor: _,
      ...paymaster
    } = await getStubData({
      ...request,
      chainId: await getChainId(),
      context: paymasterContext,
      entryPointAddress: account.entryPoint.address,
    })
    isPaymasterPopulated = isFinal
    request = { ...request, ...paymaster }
  }

  if (account.entryPoint.version === '0.6' && !request.paymasterAndData)
    request.paymasterAndData = '0x'

  if (parameters.includes('gas')) {
    if (account.userOperation?.estimateGas) {
      const gas = await account.userOperation.estimateGas(
        // The hook intentionally receives the currently prepared subset.
        request as Partial<UserOperation.UserOperation>,
      )
      request = { ...request, ...gas }
    }

    if (
      request.callGasLimit === undefined ||
      request.preVerificationGas === undefined ||
      request.verificationGasLimit === undefined ||
      (request.paymaster !== undefined &&
        request.paymasterPostOpGasLimit === undefined) ||
      (request.paymaster !== undefined &&
        request.paymasterVerificationGasLimit === undefined)
    ) {
      const gas = await estimateGas(client, {
        account,
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
      } as estimateGas.Options<account, SmartAccount.SmartAccount>)
      request = {
        ...request,
        callGasLimit: request.callGasLimit ?? gas.callGasLimit,
        paymasterPostOpGasLimit:
          request.paymasterPostOpGasLimit ?? gas.paymasterPostOpGasLimit,
        paymasterVerificationGasLimit:
          request.paymasterVerificationGasLimit ??
          gas.paymasterVerificationGasLimit,
        preVerificationGas:
          request.preVerificationGas ?? gas.preVerificationGas,
        verificationGasLimit:
          request.verificationGasLimit ?? gas.verificationGasLimit,
      }
    }
  }

  if (
    parameters.includes('paymaster') &&
    getData &&
    !paymasterAddress &&
    !options.paymasterAndData &&
    !isPaymasterPopulated
  )
    request = {
      ...request,
      ...(await getData({
        ...request,
        chainId: await getChainId(),
        context: paymasterContext,
        entryPointAddress: account.entryPoint.address,
      })),
    }

  delete request.calls
  delete request.parameters
  delete request.paymasterContext
  if (typeof request.paymaster !== 'string') delete request.paymaster

  // Runtime-selected EntryPoint fields are represented by the conditional return type.
  return request as unknown as prepare.ReturnType<
    account,
    accountOverride,
    calls,
    options
  >
}

export declare namespace prepare {
  /** Parameter that {@link prepare} can populate. */
  type Parameter = (typeof defaultParameters)[number]

  /** Options for {@link prepare}. */
  type Options<
    account extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    accountOverride extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    calls extends readonly unknown[] = readonly unknown[],
    derivedAccount extends SmartAccount.SmartAccount | undefined =
      DeriveAccount<account, accountOverride>,
    entryPointVersion extends EntryPoint.Version =
      EntryPointVersion<derivedAccount>,
  > = Assign<
    UserOperation.Request<entryPointVersion, calls>,
    GetAccountParameter<account, accountOverride> & {
      /** Data appended to the encoded Smart Account calldata. */
      dataSuffix?: Hex.Hex | undefined
      /** Parameters to populate. @default {@link defaultParameters} */
      parameters?: readonly Parameter[] | undefined
      /** Paymaster address, Bundler support, or Paymaster hooks. */
      paymaster?: Address.Address | Client.Paymaster | undefined
      /** Context passed to Paymaster hooks. */
      paymasterContext?: unknown
      /** State overrides used while estimating gas. */
      stateOverride?: StateOverrides.StateOverrides | undefined
    }
  >

  /** Return type of {@link prepare}. */
  type ReturnType<
    account extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    accountOverride extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    calls extends readonly unknown[] = readonly unknown[],
    request extends {
      parameters?: readonly Parameter[] | undefined
    } = Options<account, accountOverride, calls>,
    parameters extends Parameter =
      request['parameters'] extends readonly Parameter[]
        ? request['parameters'][number]
        : (typeof defaultParameters)[number],
    derivedAccount extends SmartAccount.SmartAccount | undefined =
      DeriveAccount<account, accountOverride>,
    entryPointVersion extends EntryPoint.Version =
      EntryPointVersion<derivedAccount>,
  > = Prettify<
    DistributiveOmit<request, 'calls' | 'parameters'> & {
      callData: Hex.Hex
      sender: Address.Address
    } & (Extract<parameters, 'authorization'> extends never
        ? {}
        : AuthorizationProperties<entryPointVersion>) &
      (Extract<parameters, 'factory'> extends never
        ? {}
        : FactoryProperties<entryPointVersion>) &
      (Extract<parameters, 'fees'> extends never ? {} : FeeProperties) &
      (Extract<parameters, 'gas'> extends never
        ? {}
        : GasProperties<entryPointVersion>) &
      (Extract<parameters, 'nonce'> extends never ? {} : NonceProperties) &
      (Extract<parameters, 'paymaster'> extends never
        ? {}
        : PaymasterProperties<entryPointVersion>) &
      (Extract<parameters, 'signature'> extends never
        ? {}
        : SignatureProperties)
  >

  /** Errors thrown by {@link prepare}. */
  type ErrorType =
    | Account.NotFoundError
    | AbiFunction.encodeData.ErrorType
    | estimateFeesPerGas.ErrorType
    | getPaymasterData.ErrorType
    | getPaymasterStubData.ErrorType
    | getId.ErrorType
    | Hex.concat.ErrorType
    | prepareAuthorization.ErrorType
    | Errors.GlobalErrorType
}

type DeriveAccount<
  account extends SmartAccount.SmartAccount | undefined,
  accountOverride extends SmartAccount.SmartAccount | undefined,
> = accountOverride extends SmartAccount.SmartAccount
  ? accountOverride
  : account

type EntryPointVersion<account extends SmartAccount.SmartAccount | undefined> =
  account extends {
    entryPoint: { version: infer version extends EntryPoint.Version }
  }
    ? version
    : EntryPoint.Version

type GetAccountParameter<
  account extends SmartAccount.SmartAccount | undefined,
  accountOverride extends SmartAccount.SmartAccount | undefined,
  required extends boolean = true,
> =
  IsUndefined<account> extends true
    ? required extends true
      ? {
          account: IsUndefined<accountOverride> extends true
            ? SmartAccount.SmartAccount
            : accountOverride | SmartAccount.SmartAccount
        }
      : {
          account?: accountOverride | SmartAccount.SmartAccount | undefined
        }
    : { account?: accountOverride | SmartAccount.SmartAccount | undefined }

type AuthorizationProperties<entryPointVersion extends EntryPoint.Version> =
  entryPointVersion extends '0.8' | '0.9'
    ? { authorization: Authorization.Signed | undefined }
    : {}

type FactoryProperties<entryPointVersion extends EntryPoint.Version> = OneOf<
  | (entryPointVersion extends '0.6'
      ? { initCode: Hex.Hex | undefined }
      : never)
  | (entryPointVersion extends '0.7' | '0.8' | '0.9'
      ? {
          factory: Address.Address | undefined
          factoryData: Hex.Hex | undefined
        }
      : never)
>

type FeeProperties = {
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
}

type GasProperties<entryPointVersion extends EntryPoint.Version> =
  UserOperationGas.UserOperationGas<entryPointVersion>

type NonceProperties = { nonce: bigint }

type PaymasterProperties<entryPointVersion extends EntryPoint.Version> = OneOf<
  | (entryPointVersion extends '0.6' ? { paymasterAndData: Hex.Hex } : never)
  | (entryPointVersion extends '0.7' | '0.8'
      ? {
          paymaster: Address.Address | undefined
          paymasterData: Hex.Hex | undefined
          paymasterPostOpGasLimit: bigint | undefined
          paymasterVerificationGasLimit: bigint | undefined
        }
      : never)
  | (entryPointVersion extends '0.9'
      ? {
          paymaster: Address.Address | undefined
          paymasterData: Hex.Hex | undefined
          paymasterPostOpGasLimit: bigint | undefined
          paymasterSignature: Hex.Hex | undefined
          paymasterVerificationGasLimit: bigint | undefined
        }
      : never)
>

type SignatureProperties = { signature: Hex.Hex }

type InternalRequest = {
  account?: SmartAccount.SmartAccount | undefined
  authorization?: Authorization.Signed | undefined
  callData?: Hex.Hex | undefined
  callGasLimit?: bigint | undefined
  calls?: readonly Call[] | undefined
  chainId?: number | undefined
  context?: unknown
  dataSuffix?: Hex.Hex | undefined
  entryPointAddress?: Address.Address | undefined
  factory?: Address.Address | undefined
  factoryData?: Hex.Hex | undefined
  initCode?: Hex.Hex | undefined
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  nonce?: bigint | undefined
  parameters?: readonly prepare.Parameter[] | undefined
  paymaster?: Address.Address | undefined
  paymasterAndData?: Hex.Hex | undefined
  paymasterContext?: unknown
  paymasterData?: Hex.Hex | undefined
  paymasterPostOpGasLimit?: bigint | undefined
  paymasterSignature?: Hex.Hex | undefined
  paymasterVerificationGasLimit?: bigint | undefined
  preVerificationGas?: bigint | undefined
  sender?: Address.Address | undefined
  signature?: Hex.Hex | undefined
  stateOverride?: StateOverrides.StateOverrides | undefined
  verificationGasLimit?: bigint | undefined
}

type PaymasterResult = {
  isFinal?: boolean | undefined
  paymaster?: Address.Address | undefined
  paymasterAndData?: Hex.Hex | undefined
  paymasterData?: Hex.Hex | undefined
  paymasterPostOpGasLimit?: bigint | undefined
  paymasterSignature?: Hex.Hex | undefined
  paymasterVerificationGasLimit?: bigint | undefined
  sponsor?: unknown
}

type PaymasterOptions = InternalRequest & {
  chainId: number
  context?: unknown
  entryPointAddress: Address.Address
}

type PaymasterActions = {
  getData?:
    | ((options: PaymasterOptions) => Promise<PaymasterResult>)
    | undefined
  getStubData?:
    | ((options: PaymasterOptions) => Promise<PaymasterResult>)
    | undefined
}

function resolvePaymasterActions<
  chain extends Chain.Chain | undefined,
  account extends SmartAccount.SmartAccount | undefined,
>(
  _client: Client.Client<chain, account>,
  paymaster: Address.Address | Client.Paymaster | undefined,
): PaymasterActions {
  if (paymaster === true)
    return {
      async getData(options) {
        return (await getPaymasterData(
          _client,
          options as getPaymasterData.Options,
        )) as PaymasterResult
      },
      async getStubData(options) {
        return (await getPaymasterStubData(
          _client,
          options as getPaymasterStubData.Options,
        )) as PaymasterResult
      },
    }
  if (typeof paymaster !== 'object') return {}

  const actions = 'paymaster' in paymaster ? paymaster.paymaster : paymaster
  const { getData, getStubData } = actions
  return {
    getStubData:
      getData && getStubData
        ? async (options) =>
            (await getStubData(
              options as getPaymasterStubData.Options,
            )) as PaymasterResult
        : getData
          ? async (options) =>
              (await getData(
                options as getPaymasterData.Options,
              )) as PaymasterResult
          : undefined,
    getData:
      getData && getStubData
        ? async (options) =>
            (await getData(
              options as getPaymasterData.Options,
            )) as PaymasterResult
        : undefined,
  }
}
