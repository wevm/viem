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
import type { BundlerRpcSchema, RpcSchema } from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import type { SmartAccount } from '../accounts/types.js'
import type { UserOperationRequest } from '../types/userOperation.js'
import { type BundlerActions, bundlerActions } from './decorators/bundler.js'
import type { PaymasterActions } from './decorators/paymaster.js'

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
  /** Client that points to an Execution RPC URL. */
  client?: client | Client | undefined
  /** Data to append to the end of User Operation calldata. */
  dataSuffix?: Hex | undefined
  /** Paymaster configuration. */
  paymaster?:
    | true
    | {
        /** Retrieves paymaster-related User Operation properties to be used for sending the User Operation. */
        getPaymasterData?: PaymasterActions['getPaymasterData'] | undefined
        /** Retrieves paymaster-related User Operation properties to be used for gas estimation. */
        getPaymasterStubData?:
          | PaymasterActions['getPaymasterStubData']
          | undefined
      }
    | undefined
  /** Paymaster context to pass to `getPaymasterData` and `getPaymasterStubData` calls. */
  paymasterContext?: unknown
  /** User Operation configuration. */
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
  dataSuffix: Hex | undefined
  paymaster: BundlerClientConfig['paymaster'] | undefined
  paymasterContext: BundlerClientConfig['paymasterContext'] | undefined
  userOperation: BundlerClientConfig['userOperation'] | undefined
}

export type CreateBundlerClientErrorType = CreateClientErrorType | ErrorType

/**
 * Creates a Bundler Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/account-abstraction/clients/bundler
 *
 * @param config - {@link BundlerClientConfig}
 * @returns A Bundler Client. {@link BundlerClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { createBundlerClient } from 'viem/account-abstraction'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const bundlerClient = createBundlerClient({
 *   client,
 *   transport: http('https://public.pimlico.io/v2/1/rpc'),
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
    dataSuffix,
    key = 'bundler',
    name = 'Bundler Client',
    paymaster,
    paymasterContext,
    transport,
    userOperation,
  } = parameters
  const client = Object.assign(
    createClient({
      ...parameters,
      chain: parameters.chain ?? client_?.chain,
      key,
      name,
      transport,
      type: 'bundlerClient',
    }),
    {
      client: client_,
      dataSuffix: dataSuffix ?? client_?.dataSuffix,
      paymaster,
      paymasterContext,
      userOperation,
    },
  )
  return client.extend(bundlerActions) as any
}
