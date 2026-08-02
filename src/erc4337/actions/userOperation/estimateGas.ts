import { Authorization, Hex, StateOverrides } from 'ox'
import type {
  Address,
  Errors as ox_Errors,
  RpcSchema as ox_RpcSchema,
} from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import * as Errors from '../../../core/Errors.js'
import type * as Transport from '../../../core/Transport.js'
import type {
  Assign,
  ExactPartial,
  MaybeRequired,
  Prettify,
} from '../../../core/internal/types.js'
import type * as BundlerClient from '../../BundlerClient.js'
import type * as EntryPoint from '../../EntryPoint.js'
import type * as SmartAccount from '../../SmartAccount.js'
import * as UserOperation from '../../UserOperation.js'
import * as UserOperationGas from '../../UserOperationGas.js'
import type { UserOperationExecutionError } from '../../errors.js'
import { getUserOperationError } from '../../internal/errors.js'
import { prepare } from './prepare.js'

/**
 * Estimates the gas required to execute a User Operation.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/erc4337'
 *
 * const gas = await Actions.userOperation.estimateGas(client, {
 *   calls: [{ to: '0x0000000000000000000000000000000000000000' }],
 * })
 * ```
 */
export async function estimateGas<
  chain extends Chain.Chain | undefined,
  account extends SmartAccount.SmartAccount | undefined,
  const calls extends readonly unknown[],
  accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
>(
  client: BundlerClient.Client<chain, account>,
  options: estimateGas.Options<account, accountOverride, calls>,
): Promise<estimateGas.ReturnType<account, accountOverride>> {
  const runtime = options as RuntimeOptions
  const {
    account: account_ = client.account,
    entryPointAddress,
    stateOverride,
  } = runtime

  if (!account_ && !runtime.sender) throw new Account.NotFoundError()
  const account = account_ as SmartAccount.SmartAccount | undefined

  const request = account
    ? await prepare<
        readonly unknown[],
        chain,
        account,
        SmartAccount.SmartAccount,
        prepare.Options<account, SmartAccount.SmartAccount>
      >(client, {
        ...runtime,
        account,
        parameters: [
          'authorization',
          'factory',
          'fees',
          'nonce',
          'paymaster',
          'signature',
        ],
      } as unknown as prepare.Options<account, SmartAccount.SmartAccount>)
    : runtime

  const entryPoint = entryPointAddress ?? account?.entryPoint.address
  if (!entryPoint) throw new Account.NotFoundError()

  try {
    type Version = EntryPointVersion<DeriveAccount<account, accountOverride>>
    const request_ = client.request as Transport.RequestFn<RpcSchema<Version>>
    const userOperation = toRpc<Version>(request)
    const result = stateOverride
      ? await request_({
          method: 'eth_estimateUserOperationGas',
          params: [
            userOperation,
            entryPoint,
            StateOverrides.toRpc(stateOverride),
          ],
        })
      : await request_({
          method: 'eth_estimateUserOperationGas',
          params: [userOperation, entryPoint],
        })

    return UserOperationGas.fromRpc<Version>(result) as estimateGas.ReturnType<
      account,
      accountOverride
    >
  } catch (error) {
    const calls = runtime.calls
    // Error formatting accepts the partially estimated request at this wire seam.
    throw getUserOperationError(toBaseError(error), {
      ...request,
      ...(calls ? { calls } : {}),
    } as UserOperation.UserOperation & {
      calls?: readonly unknown[] | undefined
    })
  }
}

export declare namespace estimateGas {
  /** Options for {@link estimateGas}. */
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
  > = GetAccountParameter<account, accountOverride> &
    Assign<
      UserOperation.Request<entryPointVersion, calls>,
      {
        /** Paymaster address, Bundler support, or Paymaster hooks. */
        paymaster?: Address.Address | BundlerClient.Paymaster | undefined
        /** Context passed to Paymaster hooks. */
        paymasterContext?: unknown
        /** State overrides applied during estimation. */
        stateOverride?: StateOverrides.StateOverrides | undefined
      }
    > &
    MaybeRequired<
      { entryPointAddress?: Address.Address | undefined },
      derivedAccount extends undefined ? true : false
    >

  /** Return type of {@link estimateGas}. */
  type ReturnType<
    account extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    accountOverride extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
  > = Prettify<
    UserOperationGas.UserOperationGas<
      EntryPointVersion<DeriveAccount<account, accountOverride>>
    >
  >

  /** Errors thrown by {@link estimateGas}. */
  type ErrorType =
    | Account.NotFoundError
    | prepare.ErrorType
    | UserOperationExecutionError
    | ox_Errors.GlobalErrorType
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
> = {
  account?:
    | Exclude<account, undefined>
    | accountOverride
    | SmartAccount.SmartAccount
    | undefined
}

type RpcSchema<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
> = ox_RpcSchema.From<{
  Request: {
    method: 'eth_estimateUserOperationGas'
    params:
      | [
          userOperation: ExactPartial<UserOperation.Rpc<entryPointVersion>>,
          entryPoint: Address.Address,
        ]
      | [
          userOperation: ExactPartial<UserOperation.Rpc<entryPointVersion>>,
          entryPoint: Address.Address,
          stateOverride: StateOverrides.Rpc,
        ]
  }
  ReturnType: UserOperationGas.Rpc<entryPointVersion>
}>

type RuntimeOptions = {
  account?: SmartAccount.SmartAccount | undefined
  authorization?: Authorization.Signed | undefined
  callData?: Hex.Hex | undefined
  callGasLimit?: bigint | undefined
  calls?: readonly unknown[] | undefined
  entryPointAddress?: Address.Address | undefined
  factory?: Address.Address | undefined
  factoryData?: Hex.Hex | undefined
  initCode?: Hex.Hex | undefined
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  nonce?: bigint | undefined
  paymaster?: Address.Address | BundlerClient.Paymaster | undefined
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

function toRpc<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(
  userOperation: RuntimeOptions,
): ExactPartial<UserOperation.Rpc<entryPointVersion>> {
  const rpc: ExactPartial<UserOperation.Rpc<EntryPoint.Version>> = {}
  if (userOperation.authorization)
    rpc.eip7702Auth = Authorization.toRpc(userOperation.authorization)
  if (userOperation.callData !== undefined)
    rpc.callData = userOperation.callData
  if (userOperation.callGasLimit !== undefined)
    rpc.callGasLimit = Hex.fromNumber(userOperation.callGasLimit)
  if (userOperation.factory !== undefined) rpc.factory = userOperation.factory
  if (userOperation.factoryData !== undefined)
    rpc.factoryData = userOperation.factoryData
  if (userOperation.initCode !== undefined)
    rpc.initCode = userOperation.initCode
  if (userOperation.maxFeePerGas !== undefined)
    rpc.maxFeePerGas = Hex.fromNumber(userOperation.maxFeePerGas)
  if (userOperation.maxPriorityFeePerGas !== undefined)
    rpc.maxPriorityFeePerGas = Hex.fromNumber(
      userOperation.maxPriorityFeePerGas,
    )
  if (userOperation.nonce !== undefined)
    rpc.nonce = Hex.fromNumber(userOperation.nonce)
  if (typeof userOperation.paymaster === 'string')
    rpc.paymaster = userOperation.paymaster
  if (userOperation.paymasterAndData !== undefined)
    rpc.paymasterAndData = userOperation.paymasterAndData
  if (userOperation.paymasterData !== undefined)
    rpc.paymasterData = userOperation.paymasterData
  if (userOperation.paymasterPostOpGasLimit !== undefined)
    rpc.paymasterPostOpGasLimit = Hex.fromNumber(
      userOperation.paymasterPostOpGasLimit,
    )
  if (userOperation.paymasterSignature !== undefined)
    rpc.paymasterSignature = userOperation.paymasterSignature
  if (userOperation.paymasterVerificationGasLimit !== undefined)
    rpc.paymasterVerificationGasLimit = Hex.fromNumber(
      userOperation.paymasterVerificationGasLimit,
    )
  if (userOperation.preVerificationGas !== undefined)
    rpc.preVerificationGas = Hex.fromNumber(userOperation.preVerificationGas)
  if (userOperation.sender !== undefined) rpc.sender = userOperation.sender
  if (userOperation.signature !== undefined)
    rpc.signature = userOperation.signature
  if (userOperation.verificationGasLimit !== undefined)
    rpc.verificationGasLimit = Hex.fromNumber(
      userOperation.verificationGasLimit,
    )
  return rpc as ExactPartial<UserOperation.Rpc<entryPointVersion>>
}

function toBaseError(error: unknown) {
  if (error instanceof Errors.BaseError) return error
  const cause = error instanceof Error ? error : new Error(String(error))
  return new Errors.BaseError(cause.message, { cause })
}
