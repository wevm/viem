import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import { getChainContractAddress } from '../../../utils/chain/getChainContractAddress.js'
import type { SmartAccount } from '../accounts/types.js'
import { formatUserOperationGas } from '../formatters/gas.js'
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
import type {
  EstimateUserOperationGasReturnType as EstimateUserOperationGasReturnType_,
  UserOperationRequest,
} from '../types/userOperation.js'
import {
  type PrepareUserOperationRequestParameters,
  prepareUserOperationRequest,
} from './prepareUserOperationRequest.js'

export type EstimateUserOperationGasParameters<
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
  GetSmartAccountParameter<account, accountOverride> &
  GetChainParameter<chain, chainOverride> & {
    entryPointAddress?: Address
  }

export type EstimateUserOperationGasReturnType<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  //
  _derivedAccount extends SmartAccount | undefined = DeriveSmartAccount<
    account,
    accountOverride
  >,
  _derivedVersion extends
    EntryPointVersion = DeriveEntryPointVersion<_derivedAccount>,
> = EstimateUserOperationGasReturnType_<_derivedVersion>

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
  account extends SmartAccount | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends SmartAccount | undefined = undefined,
>(
  client: Client<Transport, chain, account, BundlerRpcSchema>,
  parameters: EstimateUserOperationGasParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
): Promise<EstimateUserOperationGasReturnType<account, accountOverride>> {
  const { chain = client.chain, entryPointAddress: entryPointAddress_ } =
    parameters

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

  const request = await prepareUserOperationRequest(
    client,
    parameters as PrepareUserOperationRequestParameters,
  )

  try {
    const result = await client.request({
      method: 'eth_estimateUserOperationGas',
      params: [formatUserOperationRequest(request), entryPointAddress],
    })
    return formatUserOperationGas(result) as EstimateUserOperationGasReturnType<
      account,
      accountOverride
    >
  } catch (error) {
    // biome-ignore lint/complexity/noUselessCatch: TODO – `getEstimateUserOperationGasError`
    throw error
  }
}
