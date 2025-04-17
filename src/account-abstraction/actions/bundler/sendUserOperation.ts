import type { Address, Narrow } from 'abitype'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { BaseError } from '../../../errors/base.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Calls } from '../../../types/calls.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { Assign, MaybeRequired, OneOf } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import { getAction } from '../../../utils/getAction.js'
import type { SmartAccount } from '../../accounts/types.js'
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
import { getUserOperationError } from '../../utils/errors/getUserOperationError.js'
import {
  type FormatUserOperationRequestErrorType,
  formatUserOperationRequest,
} from '../../utils/formatters/userOperationRequest.js'
import {
  type PrepareUserOperationErrorType,
  type PrepareUserOperationParameters,
  prepareUserOperation,
} from './prepareUserOperation.js'

export type SendUserOperationParameters<
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
> = GetSmartAccountParameter<account, accountOverride, false> &
  (
    | UserOperation // Accept a full-formed User Operation.
    | Assign<
        // Accept a partially-formed User Operation (UserOperationRequest) to be filled.
        UserOperationRequest<_derivedVersion>,
        OneOf<{ calls: Calls<Narrow<calls>> } | { callData: Hex }> & {
          paymaster?:
            | Address
            | true
            | {
                /** Retrieves paymaster-related User Operation properties to be used for sending the User Operation. */
                getPaymasterData?:
                  | PaymasterActions['getPaymasterData']
                  | undefined
                /** Retrieves paymaster-related User Operation properties to be used for gas estimation. */
                getPaymasterStubData?:
                  | PaymasterActions['getPaymasterStubData']
                  | undefined
              }
            | undefined
          /** Paymaster context to pass to `getPaymasterData` and `getPaymasterStubData` calls. */
          paymasterContext?: unknown | undefined
        }
      >
  ) &
  // Allow the EntryPoint address to be overridden, if no Account is provided, it will need to be required.
  MaybeRequired<
    { entryPointAddress?: Address },
    _derivedAccount extends undefined ? true : false
  >
export type SendUserOperationReturnType = Hex

export type SendUserOperationErrorType =
  | FormatUserOperationRequestErrorType
  | PrepareUserOperationErrorType
  | RequestErrorType
  | ErrorType

/**
 * Broadcasts a User Operation to the Bundler.
 *
 * - Docs: https://viem.sh/actions/bundler/sendUserOperation
 *
 * @param client - Client to use
 * @param parameters - {@link SendUserOperationParameters}
 * @returns The User Operation hash. {@link SendUserOperationReturnType}
 *
 * @example
 * import { createBundlerClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { toSmartAccount } from 'viem/accounts'
 * import { sendUserOperation } from 'viem/actions'
 *
 * const account = await toSmartAccount({ ... })
 *
 * const bundlerClient = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const values = await sendUserOperation(bundlerClient, {
 *   account,
 *   calls: [{ to: '0x...', value: parseEther('1') }],
 * })
 */
export async function sendUserOperation<
  const calls extends readonly unknown[],
  account extends SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, Chain | undefined, account>,
  parameters: SendUserOperationParameters<account, accountOverride, calls>,
) {
  const { account: account_ = client.account, entryPointAddress } = parameters

  if (!account_ && !parameters.sender) throw new AccountNotFoundError()
  const account = account_ ? parseAccount(account_) : undefined

  const request = account
    ? await getAction(
        client,
        prepareUserOperation,
        'prepareUserOperation',
      )(parameters as unknown as PrepareUserOperationParameters)
    : parameters

  const signature = (parameters.signature ||
    (await account?.signUserOperation?.(request as UserOperation)))!

  const rpcParameters = formatUserOperationRequest({
    ...request,
    signature,
  } as UserOperation)

  try {
    return await client.request(
      {
        method: 'eth_sendUserOperation',
        params: [
          rpcParameters,
          (entryPointAddress ?? account?.entryPoint?.address)!,
        ],
      },
      { retryCount: 0 },
    )
  } catch (error) {
    const calls = (parameters as any).calls
    throw getUserOperationError(error as BaseError, {
      ...(request as UserOperation),
      ...(calls ? { calls } : {}),
      signature,
    })
  }
}
