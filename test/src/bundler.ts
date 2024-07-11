import { createServer } from 'prool'
import { alto } from 'prool/instances'
import { mainnet } from '../../src/chains/index.js'
import type {
  BundlerClient,
  BundlerClientConfig,
} from '../../src/clients/createBundlerClient.js'
import {
  http,
  type Chain,
  type Client,
  type ClientConfig,
  type ExactPartial,
  type Transport,
  createBundlerClient,
} from '../../src/index.js'
import type { DebugBundlerRpcSchema } from '../../src/types/eip1193.js'
import { anvilMainnet } from './anvil.js'
import { accounts, poolId } from './constants.js'

export const bundlerMainnet = defineBundler({
  chain: mainnet,
  rpcUrl: (key) => `http://localhost:${anvilMainnet.port}/${key}`,
  port: 4337,
})

////////////////////////////////////////////////////////////
// Utilities

type DefineBundlerParameters<chain extends Chain> = {
  chain: chain
  rpcUrl: (key: number) => string
  port: number
}

type DefineBundlerReturnType<chain extends Chain> = {
  chain: chain
  clientConfig: BundlerClientConfig<Transport, chain, undefined>
  getBundlerClient<
    config extends ExactPartial<
      Omit<BundlerClientConfig, 'chain'> & {
        chain?: false | undefined
      }
    >,
  >(
    config?: config | undefined,
  ): BundlerClient<
    config['transport'] extends Transport ? config['transport'] : Transport,
    config['chain'] extends false ? undefined : chain,
    undefined,
    config['client'] extends Client ? config['client'] : undefined,
    DebugBundlerRpcSchema
  >
  port: number
  rpcUrl: {
    http: string
  }
  restart(): Promise<void>
  start(): Promise<() => Promise<void>>
}

function defineBundler<const chain extends Chain>({
  chain: chain_,
  port,
  rpcUrl,
}: DefineBundlerParameters<chain>): DefineBundlerReturnType<chain> {
  const chain = {
    ...chain_,
    name: `${chain_.name} (Local)`,
  } as const satisfies Chain

  const bundlerRpcUrl = `http://localhost:${port}/${poolId}`

  const clientConfig = {
    batch: {
      multicall: process.env.VITE_BATCH_MULTICALL === 'true',
    },
    chain,
    pollingInterval: 100,
    transport(args) {
      return http(bundlerRpcUrl)(args)
    },
  } as const satisfies ClientConfig

  return {
    chain,
    clientConfig,
    getBundlerClient(config) {
      return createBundlerClient({
        ...clientConfig,
        ...config,
        chain: config?.chain === false ? undefined : chain,
        transport: clientConfig.transport,
      }) as any as never
    },
    port,
    rpcUrl: {
      http: bundlerRpcUrl,
    },
    async restart() {
      await fetch(`${bundlerRpcUrl}/restart`)
    },
    async start() {
      return await createServer({
        instance: (key) =>
          alto({
            enableDebugEndpoints: true,
            entrypoints: [
              '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
              '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
            ],
            entrypointSimulationContract:
              '0x74Cb5e4eE81b86e70f9045036a1C5477de69eE87',
            executorPrivateKeys: [accounts[0].privateKey],
            rpcUrl: rpcUrl(key),
            safeMode: false,
          }),
        port,
      }).start()
    },
  } as const
}
