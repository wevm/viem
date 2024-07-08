import type { Address } from 'abitype'
import type { SmartAccount } from '../../accounts/types.js'
import {
  type EstimateUserOperationGasParameters,
  type EstimateUserOperationGasReturnType,
  estimateUserOperationGas,
} from '../../actions/bundler/estimateUserOperationGas.js'
import {
  type GetSupportedEntryPointsReturnType,
  getSupportedEntryPoints,
} from '../../actions/bundler/getSupportedEntryPoints.js'
import {
  type PrepareUserOperationParameters,
  type PrepareUserOperationRequest,
  type PrepareUserOperationReturnType,
  prepareUserOperation,
} from '../../actions/bundler/prepareUserOperation.js'
import {
  type SendUserOperationParameters,
  type SendUserOperationReturnType,
  sendUserOperation,
} from '../../actions/bundler/sendUserOperation.js'
import {
  type GetChainIdReturnType,
  getChainId,
} from '../../actions/public/getChainId.js'
import type { Chain } from '../../types/chain.js'
import type { Client } from '../createClient.js'
import type { Transport } from '../transports/createTransport.js'

export type BundlerActions<
  account extends SmartAccount | undefined = SmartAccount | undefined,
> = {
  /**
   * Returns an estimate of gas values necessary to execute the User Operation.
   *
   * - Docs: https://viem.sh/actions/bundler/estimateUserOperationGas
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateUserOperationGasParameters}
   * @returns The gas estimate (in wei). {@link EstimateUserOperationGasReturnType}
   *
   * @example
   * import { createBundlerClient, http, parseEther } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { toSmartAccount } from 'viem/accounts'
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
   * - Docs: https://viem.sh/actions/bundler/getSupportedEntryPoints
   *
   * @param client - Client to use
   * @param parameters - {@link GetSupportedEntryPointsParameters}
   * @returns Supported Entry Points. {@link GetSupportedEntryPointsReturnType}
   *
   * @example
   * import { createBundlerClient, http, parseEther } from 'viem'
   * import { mainnet } from 'viem/chains'
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
   * - Docs: https://viem.sh/actions/bundler/prepareUserOperation
   *
   * @param args - {@link PrepareUserOperationParameters}
   * @returns The User Operation. {@link PrepareUserOperationReturnType}
   *
   * @example
   * import { createBundlerClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { toSmartAccount } from 'viem/accounts'
   *
   * const account = await toSmartAccount({ ... })
   *
   * const client = createBundlerClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const request = await client.prepareUserOperation({
   *   account,
   *   calls: [{ to: '0x...', value: parseEther('1') }],
   * })
   */
  prepareUserOperation: <
    const request extends PrepareUserOperationRequest<account, accountOverride>,
    accountOverride extends SmartAccount | undefined = undefined,
  >(
    parameters: PrepareUserOperationParameters<
      account,
      accountOverride,
      request
    >,
  ) => Promise<
    PrepareUserOperationReturnType<account, accountOverride, request>
  >
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
      prepareUserOperation: (parameters) =>
        prepareUserOperation(client, parameters),
      sendUserOperation: (parameters) => sendUserOperation(client, parameters),
    }
  }
}
