import type { Address } from 'abitype'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { getChainContractAddress } from '../../../utils/chain/getChainContractAddress.js'
import type { SmartAccount } from '../accounts/types.js'
import { formatUserOperationRequest } from '../formatters/userOperation.js'
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

export type SendUserOperationParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  //
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = UserOperationRequest<_derivedVersion> &
  GetSmartAccountParameter<account> &
  GetChainParameter<chain, chainOverride> & {
    entryPointAddress?: Address
  }

export type SendUserOperationReturnType = Hex

export type SendUserOperationErrorType = ErrorType

/**
 * Broadcasts a User Operation to the Bundler.
 *
 * - Docs: https://viem.sh/erc4337/actions/sendUserOperation
 *
 * @param client - Client to use
 * @param parameters - {@link SendUserOperationParameters}
 * @returns The User Operation hash. {@link SendUserOperationReturnType}
 *
 * @example
 * import { createBundlerClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendUserOperation, toSimpleAccount } from 'viem/experimental'
 *
 * const account = toSimpleAccount({
 *   owner: '0x...',
 * })
 * const bundlerClient = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const values = await sendUserOperation(bundlerClient, {
 *   account,
 *   callData: {
 *     to: '0x...',
 *     value: parseEther('1'),
 *   },
 * })
 */
export async function sendUserOperation<
  chain extends Chain | undefined,
  account extends SmartAccount | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, chain, account, BundlerRpcSchema>,
  parameters: SendUserOperationParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
) {
  const {
    account: account_ = client.account,
    callData,
    callGasLimit,
    chain = client.chain,
    entryPointAddress: entryPointAddress_,
    factory,
    factoryData,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    preVerificationGas,
    sender,
    signature,
    verificationGasLimit,
  } = parameters as SendUserOperationParameters

  if (!account_ && !sender)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    })
  const account = parseAccount(account_! || sender!)

  const entryPointAddress = (() => {
    if (entryPointAddress_) return entryPointAddress_
    if (!chain)
      throw new Error(
        'client chain not configured. entryPointAddress is required.',
      )
    return getChainContractAddress({
      chain,
      contract: 'entryPoint07',
    })
  })()

  // TODO: `prepareUserOperationRequest`

  const rpcParameters = formatUserOperationRequest({
    callData,
    callGasLimit,
    factory,
    factoryData,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    preVerificationGas,
    sender: account.address,
    signature,
    verificationGasLimit,
  })

  try {
    return await client.request({
      method: 'eth_sendUserOperation',
      params: [rpcParameters, entryPointAddress],
    })
  } catch (error) {
    // biome-ignore lint/complexity/noUselessCatch: TODO – `getUserOperationError`
    throw error
  }
}
