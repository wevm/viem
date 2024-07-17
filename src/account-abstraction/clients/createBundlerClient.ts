import type { EstimateFeesPerGasReturnType } from '../../actions/public/estimateFeesPerGas.js'
import {
  type Client,
  type ClientConfig,
  type CreateClientErrorType,
  createClient,
} from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { RpcSchema } from '../../types/eip1193.js'
import type { BundlerRpcSchema } from '../../types/eip1193.js'
import type { Prettify } from '../../types/utils.js'
import type { SmartAccount } from '../accounts/types.js'
import type { UserOperationRequest } from '../types/userOperation.js'
import { type BundlerActions, bundlerActions } from './decorators/bundler.js'

export type BundlerClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Pick<
    ClientConfig<transport, chain, account, rpcSchema>,
    | 'account'
    | 'cacheTime'
    | 'chain'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'rpcSchema'
    | 'transport'
  >
> & {
  /** Client that points to an execution RPC URL. */
  client?: client | Client | undefined
  /** User Operation configuration properties. */
  userOperation?:
    | {
        /** Prepares fee properties for the User Operation request. */
        estimateFeesPerGas?:
          | ((parameters: {
              account: account | SmartAccount
              bundlerClient: Client
              userOperation: UserOperationRequest
            }) => Promise<EstimateFeesPerGasReturnType<'eip1559'>>)
          | undefined
        /** Prepares sponsorship properties for the User Operation request. */
        sponsorUserOperation?:
          | ((parameters: {
              account: account | SmartAccount
              bundlerClient: Client
              userOperation: UserOperationRequest
            }) => Promise<UserOperationRequest>)
          | undefined
      }
    | undefined
}

export type BundlerClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Client<
    transport,
    chain extends Chain
      ? chain
      : client extends Client<any, infer chain>
        ? chain
        : undefined,
    account,
    rpcSchema extends RpcSchema
      ? [...BundlerRpcSchema, ...rpcSchema]
      : BundlerRpcSchema,
    BundlerActions<account>
  >
> & {
  client: client
  userOperation?: BundlerClientConfig['userOperation'] | undefined
}

export type CreateBundlerClientErrorType = CreateClientErrorType | ErrorType

/**
 * Creates a Bundler Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/clients/bundler
 *
 * @param config - {@link BundlerClientConfig}
 * @returns A Bundler Client. {@link BundlerClient}
 *
 * @example
 * import { createBundlerClient, createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const bundlerClient = createBundlerClient({
 *   client,
 *   transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
 * })
 */
export function createBundlerClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: BundlerClientConfig<transport, chain, account, client, rpcSchema>,
): BundlerClient<transport, chain, account, client, rpcSchema>

export function createBundlerClient(
  parameters: BundlerClientConfig,
): BundlerClient {
  const {
    client: client_,
    key = 'bundler',
    name = 'Bundler Client',
    transport,
    userOperation,
  } = parameters
  const client = Object.assign(
    createClient({
      ...parameters,
      key,
      name,
      transport,
      type: 'bundlerClient',
    }),
    { client: client_, userOperation },
  )
  return client.extend(bundlerActions) as any
}
