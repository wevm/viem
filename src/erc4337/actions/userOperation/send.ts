import type { Address, Authorization, Errors as ox_Errors, Hex } from 'ox'
import type { RpcSchema } from 'ox/erc4337'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import * as Errors from '../../../core/Errors.js'
import type * as Transport from '../../../core/Transport.js'
import type { Assign, MaybeRequired } from '../../../core/internal/types.js'
import type * as BundlerClient from '../../BundlerClient.js'
import type * as EntryPoint from '../../EntryPoint.js'
import type * as SmartAccount from '../../SmartAccount.js'
import * as UserOperation from '../../UserOperation.js'
import type { UserOperationExecutionError } from '../../errors.js'
import { getUserOperationError } from '../../internal/errors.js'
import { prepare } from './prepare.js'

/**
 * Signs and broadcasts a User Operation to a Bundler.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/erc4337'
 *
 * const hash = await Actions.userOperation.send(client, {
 *   calls: [{ to: '0x0000000000000000000000000000000000000000' }],
 * })
 * ```
 */
export async function send<
  chain extends Chain.Chain | undefined,
  account extends SmartAccount.SmartAccount | undefined,
  const calls extends readonly unknown[],
  accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
>(
  client: BundlerClient.Client<chain, account>,
  options: send.Options<account, accountOverride, calls>,
): Promise<send.ReturnType> {
  const runtime = options as RuntimeOptions
  const { account: account_ = client.account, entryPointAddress } = runtime

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
      } as unknown as prepare.Options<account, SmartAccount.SmartAccount>)
    : runtime
  const signature =
    runtime.signature ??
    (await account?.signUserOperation(
      // Preparation guarantees the complete signing shape.
      request as UserOperation.UserOperation,
    ))

  const entryPoint = entryPointAddress ?? account?.entryPoint.address
  if (!entryPoint) throw new Account.NotFoundError()

  try {
    const request_ = client.request as Transport.RequestFn<RpcSchema.Bundler>
    return await request_(
      {
        method: 'eth_sendUserOperation',
        params: [
          UserOperation.toRpc({
            ...request,
            signature,
          } as UserOperation.UserOperation),
          entryPoint,
        ],
      },
      { retryCount: 0 },
    )
  } catch (error) {
    const calls = runtime.calls
    throw getUserOperationError(toBaseError(error), {
      ...request,
      ...(calls ? { calls } : {}),
      signature,
    } as UserOperation.UserOperation & {
      calls?: readonly unknown[] | undefined
    })
  }
}

export declare namespace send {
  /** Options for {@link send}. */
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
        /** Data appended to encoded Smart Account calldata. */
        dataSuffix?: Hex.Hex | undefined
        /** Paymaster address, Bundler support, or Paymaster hooks. */
        paymaster?: Address.Address | BundlerClient.Paymaster | undefined
        /** Context passed to Paymaster hooks. */
        paymasterContext?: unknown
      }
    > &
    MaybeRequired<
      { entryPointAddress?: Address.Address | undefined },
      derivedAccount extends undefined ? true : false
    >

  /** Return type of {@link send}. */
  type ReturnType = Hex.Hex

  /** Errors thrown by {@link send}. */
  type ErrorType =
    | Account.NotFoundError
    | prepare.ErrorType
    | UserOperation.toRpc.ErrorType
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

type RuntimeOptions = {
  account?: SmartAccount.SmartAccount | undefined
  authorization?: Authorization.Signed | undefined
  callData?: Hex.Hex | undefined
  callGasLimit?: bigint | undefined
  calls?: readonly unknown[] | undefined
  chainId?: number | undefined
  dataSuffix?: Hex.Hex | undefined
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
  verificationGasLimit?: bigint | undefined
}

function toBaseError(error: unknown) {
  if (error instanceof Errors.BaseError) return error
  const cause = error instanceof Error ? error : new Error(String(error))
  return new Errors.BaseError(cause.message, { cause })
}
