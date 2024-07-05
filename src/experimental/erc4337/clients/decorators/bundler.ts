import type { Address } from 'abitype'
import {
  type GetChainIdReturnType,
  getChainId,
} from '../../../../actions/public/getChainId.js'
import type { Client } from '../../../../clients/createClient.js'
import type { Transport } from '../../../../clients/transports/createTransport.js'
import type { Chain } from '../../../../types/chain.js'
import type { SmartAccount } from '../../accounts/types.js'
import {
  type EstimateUserOperationGasParameters,
  type EstimateUserOperationGasReturnType,
  estimateUserOperationGas,
} from '../../actions/estimateUserOperationGas.js'
import {
  type GetSupportedEntryPointsReturnType,
  getSupportedEntryPoints,
} from '../../actions/getSupportedEntryPoints.js'
import {
  type PrepareUserOperationRequestParameters,
  type PrepareUserOperationRequestRequest,
  type PrepareUserOperationRequestReturnType,
  prepareUserOperationRequest,
} from '../../actions/prepareUserOperationRequest.js'
import {
  type SendUserOperationParameters,
  type SendUserOperationReturnType,
  sendUserOperation,
} from '../../actions/sendUserOperation.js'

export type BundlerActions<
  account extends SmartAccount | undefined = SmartAccount | undefined,
> = {
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
   * import { http, parseEther } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { createBundlerClient, toSmartAccount } from 'viem/experimental'
   *
   * const account = await toSmartAccount({ ... })
   *
   * const bundlerClient = createBundlerClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const values = await bundlerClient.estimateUserOperationGas({
   *   account,
   *   calls: [{ to: '0x...', value: parseEther('1') }],
   * })
   */
  estimateUserOperationGas: <
    accountOverride extends SmartAccount | undefined = undefined,
  >(
    parameters: EstimateUserOperationGasParameters<account, accountOverride>,
  ) => Promise<EstimateUserOperationGasReturnType<account, accountOverride>>
  /**
   * Returns the chain ID associated with the bundler.
   *
   * - Docs: https://viem.sh/docs/actions/public/getChainId
   * - JSON-RPC Methods: [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid)
   *
   * @returns The current chain ID. {@link GetChainIdReturnType}
   *
   * @example
   * import { http } from 'viem'
   * import { createBundlerClient, mainnet } from 'viem/chains'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const chainId = await client.getChainId()
   * // 1
   */
  getChainId: () => Promise<GetChainIdReturnType>
  /**
   * Returns the EntryPoints that the bundler supports.
   *
   * - Docs: https://viem.sh/erc4337/actions/getSupportedEntryPoints
   *
   * @param client - Client to use
   * @param parameters - {@link GetSupportedEntryPointsParameters}
   * @returns Supported Entry Points. {@link GetSupportedEntryPointsReturnType}
   *
   * @example
   * import { http, parseEther } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { createBundlerClient } from 'viem/experimental'
   *
   * const bundlerClient = createBundlerClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const addresses = await bundlerClient.getSupportedEntryPoints()
   */
  getSupportedEntryPoints: () => Promise<GetSupportedEntryPointsReturnType>
  /**
   * Prepares a User Operation and fills in missing properties.
   *
   * - Docs: https://viem.sh/experimental/erc4337/prepareUserOperationRequest
   *
   * @param args - {@link PrepareUserOperationRequestParameters}
   * @returns The User Operation. {@link PrepareUserOperationRequestReturnType}
   *
   * @example
   * import { http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { createBundlerClient, toSmartAccount } from 'viem/experimental'
   *
   * const account = await toSmartAccount({ ... })
   *
   * const client = createBundlerClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const request = await client.prepareUserOperationRequest({
   *   account,
   *   calls: [{ to: '0x...', value: parseEther('1') }],
   * })
   */
  prepareUserOperationRequest: <
    const request extends PrepareUserOperationRequestRequest<
      account,
      accountOverride
    >,
    accountOverride extends SmartAccount | undefined = undefined,
  >(
    parameters: PrepareUserOperationRequestParameters<
      account,
      accountOverride,
      request
    >,
  ) => Promise<
    PrepareUserOperationRequestReturnType<account, accountOverride, request>
  >
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
   * import { http, parseEther } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { createBundlerClient, toSimpleAccount } from 'viem/experimental'
   *
   * const account = toSmartAccount({ ... })
   *
   * const bundlerClient = createBundlerClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const values = await bundlerClient.sendUserOperation({
   *   account,
   *   calls: [{ to: '0x...', value: parseEther('1') }],
   * })
   */
  sendUserOperation: <
    accountOverride extends SmartAccount | undefined = undefined,
  >(
    parameters: SendUserOperationParameters<account, accountOverride>,
  ) => Promise<SendUserOperationReturnType>
}

export type BundlerActionsParameters = {
  entryPoint: Address
}

export function bundlerActions() {
  return <
    transport extends Transport = Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends SmartAccount | undefined = SmartAccount | undefined,
  >(
    client: Client<transport, chain, account>,
  ): BundlerActions<account> => {
    return {
      estimateUserOperationGas: (parameters) =>
        estimateUserOperationGas(client, parameters),
      getChainId: () => getChainId(client),
      getSupportedEntryPoints: () => getSupportedEntryPoints(client),
      prepareUserOperationRequest: (parameters) =>
        prepareUserOperationRequest(client, parameters),
      sendUserOperation: (parameters) => sendUserOperation(client, parameters),
    }
  }
}
