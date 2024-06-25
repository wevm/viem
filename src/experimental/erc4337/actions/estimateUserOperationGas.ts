import type { Address } from 'abitype'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { UnionPartialBy } from '../../../types/utils.js'
import { getChainContractAddress } from '../../../utils/chain/getChainContractAddress.js'
import { formatUserOperationGas } from '../formatters/gas.js'
import { formatUserOperationRequest } from '../formatters/userOperation.js'
import type { BundlerRpcSchema } from '../types/eip1193.js'
import type {
  DeriveEntryPointVersion,
  EntryPointVersion,
  GetEntryPointVersionParameter,
} from '../types/entryPointVersion.js'
import type {
  EstimateUserOperationGasReturnType as EstimateUserOperationGasReturnType_,
  UserOperationRequest,
} from '../types/userOperation.js'

export type EstimateUserOperationGasParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
  _derivedVersion extends EntryPointVersion = DeriveEntryPointVersion<
    entryPointVersion,
    entryPointVersionOverride
  >,
> = UnionPartialBy<
  UserOperationRequest<_derivedVersion>,
  // @ts-expect-error
  'maxFeePerGas' | 'maxPriorityFeePerGas'
> &
  GetAccountParameter<account> &
  GetChainParameter<chain, chainOverride> &
  GetEntryPointVersionParameter<
    entryPointVersion,
    entryPointVersionOverride
  > & {
    entryPointAddress?: Address
  }

export type EstimateUserOperationGasReturnType<
  entryPointVersion extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
  _derivedVersion extends EntryPointVersion = DeriveEntryPointVersion<
    entryPointVersion,
    entryPointVersionOverride
  >,
> = EstimateUserOperationGasReturnType_<_derivedVersion, bigint>

export type EstimateUserOperationGasErrorType = ErrorType

/**
 * Returns an estimate of gas values necessary to execute the User Operation.
 *
 * - Docs: https://viem.sh/erc4337/actions/estimateUserOperationGas
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateUserOperationGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateUserOperationGasReturnType}
 *
 * @example
 * import { createBundlerClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateUserOperationGas, toSimpleAccount } from 'viem/experimental'
 *
 * const account = toSimpleAccount({
 *   owner: '0x...',
 * })
 * const bundlerClient = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const values = await estimateUserOperationGas(bundlerClient, {
 *   account,
 *   callData: {
 *     to: '0x...',
 *     value: parseEther('1'),
 *   },
 * })
 */
export async function estimateUserOperationGas<
  chain extends Chain | undefined,
  account extends Account | undefined,
  entryPointVersion extends EntryPointVersion | undefined,
  chainOverride extends Chain | undefined = undefined,
  entryPointVersionOverride extends EntryPointVersion | undefined = undefined,
>(
  client: Client<Transport, chain, account, BundlerRpcSchema> & {
    entryPointVersion?: entryPointVersion | undefined
  },
  parameters: EstimateUserOperationGasParameters<
    chain,
    account,
    entryPointVersion,
    chainOverride,
    entryPointVersionOverride
  >,
): Promise<
  EstimateUserOperationGasReturnType<
    entryPointVersion,
    entryPointVersionOverride
  >
> {
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
    nonce = 0n,
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    preVerificationGas,
    sender,
    signature,
    verificationGasLimit,
  } = parameters as unknown as EstimateUserOperationGasParameters

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
    const result = await client.request({
      method: 'eth_estimateUserOperationGas',
      params: [rpcParameters, entryPointAddress],
    })
    return formatUserOperationGas(result) as EstimateUserOperationGasReturnType<
      entryPointVersion,
      entryPointVersionOverride
    >
  } catch (error) {
    // biome-ignore lint/complexity/noUselessCatch: TODO – `getEstimateUserOperationGasError`
    throw error
  }
}
