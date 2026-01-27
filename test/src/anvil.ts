import { Instance, Server } from 'prool'

import { mainnet, optimism, sepolia, zksync } from '../../src/chains/index.js'
import { ipc } from '../../src/clients/transports/ipc.js'
import {
  type Account,
  type Address,
  type Chain,
  type Client,
  type ClientConfig,
  createClient,
  type ExactPartial,
  http,
  type ParseAccount,
  type Transport,
  webSocket,
} from '../../src/index.js'
import { createSiweMessage } from '../../src/siwe/index.js'
import { ProviderRpcError } from '../../src/types/eip1193.js'
import { accounts, poolId } from './constants.js'

export const anvilMainnet = defineAnvil({
  chain: mainnet,
  forkUrl: getEnv('VITE_ANVIL_FORK_URL', 'https://cloudflare-eth.com'),
  forkBlockNumber: 22263623n,
  noMining: true,
  port: 8545,
})

export const anvilSepolia = defineAnvil({
  chain: sepolia,
  forkUrl: getEnv('VITE_ANVIL_FORK_URL_SEPOLIA', 'https://rpc.sepolia.org'),
  forkBlockNumber: 5858117n,
  noMining: true,
  port: 8845,
})

export const anvilOptimism = defineAnvil({
  chain: optimism,
  forkUrl: getEnv(
    'VITE_ANVIL_FORK_URL_OPTIMISM',
    'https://mainnet.optimism.io',
  ),
  forkBlockNumber: 113624777n,
  port: 8645,
})

export const anvilZksync = defineAnvil({
  chain: zksync,
  forkUrl: getEnv(
    'VITE_ANVIL_FORK_URL_ZKSYNC',
    'https://mainnet.era.zksync.io',
  ),
  forkBlockNumber: 25734n,
  port: 8745,
})

////////////////////////////////////////////////////////////
// Utilities

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  // biome-ignore lint/suspicious/noConsole: _
  console.warn(
    `\`process.env.${key}\` not found. Falling back to \`${fallback}\`.`,
  )
  return fallback
}

type DefineAnvilParameters<chain extends Chain> = Omit<
  Instance.anvil.Parameters,
  'forkBlockNumber' | 'forkUrl'
> & {
  chain: chain
  forkBlockNumber: bigint
  forkUrl: string
  port: number
}

type DefineAnvilReturnType<chain extends Chain> = {
  chain: chain
  clientConfig: ClientConfig<Transport, chain, undefined>
  forkBlockNumber: bigint
  forkUrl: string
  getClient<
    config extends ExactPartial<
      Omit<ClientConfig, 'account' | 'chain'> & {
        account?: true | Address | Account | undefined
        chain?: false | undefined
      }
    >,
  >(
    config?: config | undefined,
  ): Client<
    config['transport'] extends Transport ? config['transport'] : Transport,
    config['chain'] extends false ? undefined : chain,
    config['account'] extends Address
      ? ParseAccount<config['account']>
      : config['account'] extends Account
        ? config['account']
        : config['account'] extends true
          ? ParseAccount<(typeof accounts)[0]['address']>
          : undefined,
    undefined,
    { mode: 'anvil' }
  >
  port: number
  rpcUrl: {
    http: string
    ipc: string
    ws: string
  }
  restart(): Promise<void>
  start(): Promise<() => Promise<void>>
}

function defineAnvil<const chain extends Chain>(
  parameters: DefineAnvilParameters<chain>,
): DefineAnvilReturnType<chain> {
  const {
    chain: chain_,
    forkUrl,
    forkBlockNumber,
    port,
    ...options
  } = parameters
  const rpcUrl = {
    http: `http://127.0.0.1:${port}/${poolId}`,
    ipc: `/tmp/anvil-${poolId}.ipc`,
    ws: `ws://127.0.0.1:${port}/${poolId}`,
  } as const

  const chain = {
    ...chain_,
    name: `${chain_.name} (Local)`,
    rpcUrls: {
      default: {
        http: [rpcUrl.http],
        webSocket: [rpcUrl.ws],
      },
    },
  } as const satisfies Chain

  const clientConfig = {
    batch: {
      multicall: process.env.VITE_BATCH_MULTICALL === 'true',
    },
    chain,
    pollingInterval: 100,
    transport(args) {
      const { config, request, value } = (() => {
        if (process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket')
          return webSocket(rpcUrl.ws)(args)
        if (process.env.VITE_NETWORK_TRANSPORT_MODE === 'ipc')
          return ipc(rpcUrl.ipc)(args)
        return http(rpcUrl.http)(args)
      })()

      return {
        config,
        async request({ method, params }: any, opts: any = {}) {
          if (method === 'eth_requestAccounts') {
            return [accounts[0].address] as any
          }
          if (method === 'personal_sign') {
            method = 'eth_sign'
            params = [params[1], params[0]]
          }
          if (method === 'wallet_watchAsset') {
            if (params.type === 'ERC721') {
              throw new ProviderRpcError(
                -32602,
                'Token type ERC721 not supported.',
              )
            }
            return true
          }
          if (method === 'wallet_addEthereumChain') return null
          if (method === 'wallet_switchEthereumChain') {
            if (params[0].chainId === '0xfa') {
              throw new ProviderRpcError(-4902, 'Unrecognized chain.')
            }
            return null
          }
          if (
            method === 'wallet_getPermissions' ||
            method === 'wallet_requestPermissions'
          )
            return [
              {
                invoker: 'https://example.com',
                parentCapability: 'eth_accounts',
                caveats: [
                  {
                    type: 'filterResponse',
                    value: ['0x0c54fccd2e384b4bb6f2e405bf5cbc15a017aafb'],
                  },
                ],
              },
            ]
          if (method === 'wallet_sendTransaction') {
            method = 'eth_sendTransaction'
          }
          if (method === 'wallet_connect') {
            const capabilities = params[0].capabilities
              ? {
                  ...(params[0].capabilities?.signInWithEthereum
                    ? {
                        signInWithEthereum: {
                          message: createSiweMessage({
                            ...params[0].capabilities?.signInWithEthereum,
                            address: accounts[0].address,
                            chainId: Number(chain.id),
                            domain: 'example.com',
                            issuedAt: new Date('2024-01-01T00:00:00.000Z'),
                            expirationTime: new Date(
                              '2024-01-01T00:00:00.000Z',
                            ),
                            notBefore: new Date('2024-01-01T00:00:00.000Z'),
                            uri: 'https://example.com',
                            version: '1',
                          }),
                          signature:
                            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
                        },
                      }
                    : {}),
                  ...(params[0].capabilities?.addSubAccount
                    ? {
                        subAccounts: [
                          {
                            address: accounts[1].address,
                          },
                        ],
                      }
                    : {}),
                }
              : {}
            return {
              accounts: [
                {
                  address: accounts[0].address,
                  capabilities,
                },
              ],
            } as any
          }
          if (method === 'wallet_disconnect') {
            return null
          }
          if (method === 'wallet_addSubAccount')
            return {
              address: accounts[1].address,
            } as any

          return request({ method, params }, opts)
        },
        value,
      }
    },
  } as const satisfies ClientConfig

  return {
    chain,
    clientConfig,
    forkBlockNumber,
    forkUrl,
    getClient(config) {
      return (
        createClient({
          ...clientConfig,
          ...config,
          account:
            config?.account === true ? accounts[0].address : config?.account,
          chain: config?.chain === false ? undefined : chain,
          transport: clientConfig.transport,
        }) as any
      ).extend(() => ({ mode: 'anvil' })) as never
    },
    rpcUrl,
    port,
    async restart() {
      await fetch(`${rpcUrl.http}/restart`)
    },
    async start() {
      return await Server.create({
        instance: Instance.anvil({
          chainId: chain.id,
          forkUrl,
          forkBlockNumber,
          hardfork: 'Prague',
          ...options,
        }),
        port,
      }).start()
    },
  } as const
}
