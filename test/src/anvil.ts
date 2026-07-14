import { Provider } from 'ox'
import { Instance, Server } from 'prool'
import { Client, custom, http } from 'viem'

import * as constants from './constants.js'

export type DefineAnvilParameters = Instance.anvil.Parameters & {
  /** Initializes every pooled instance after startup. */
  initialize?: ((rpcUrl: string) => Promise<void>) | undefined
  /** Proxy port the prool server listens on. */
  port: number
}

export type Anvil = ReturnType<typeof defineAnvil>

/** Defines a prool-managed anvil instance, proxied per pool id. */
export function defineAnvil(parameters: DefineAnvilParameters) {
  const { initialize, port, ...options } = parameters
  const rpcUrl = {
    http: `http://127.0.0.1:${port}/${constants.poolId}`,
    ipc: `/tmp/anvil-${constants.poolId}.ipc`,
    ws: `ws://127.0.0.1:${port}/${constants.poolId}`,
  }
  return {
    forkBlockNumber: BigInt(parameters.forkBlockNumber ?? 0),
    forkUrl: parameters.forkUrl,
    port,
    rpcUrl,
    async start(pool: { limit: number }) {
      const instance = initialize
        ? defineInitializedAnvil(options, initialize)
        : Instance.anvil(options)
      return Server.create({ instance, limit: pool.limit, port }).start()
    },
  }
}

/** Returns a Client pointed at an anvil instance. */
export function getClient(anvil: Anvil) {
  return Client.create({
    transport: http(anvil.rpcUrl.http),
  })
}

/**
 * Returns a Client backed by an EIP-1193 provider that emulates wallet-only
 * JSON-RPC methods (which anvil does not implement) and delegates everything
 * else to the anvil instance.
 */
export function getWalletClient(
  anvil: Anvil,
  options: getWalletClient.Options = {},
) {
  const node = http(anvil.rpcUrl.http).setup({})
  const provider = Provider.from({
    async request({ method, params }: any) {
      if (method === 'eth_requestAccounts')
        return [constants.accounts[0].address]
      if (method === 'personal_sign')
        return node.request({
          method: 'eth_sign',
          params: [params[1], params[0]],
        })
      if (method === 'wallet_addEthereumChain') return null
      if (method === 'wallet_connect')
        return {
          accounts: [
            {
              address: constants.accounts[0].address,
              capabilities: params[0]?.capabilities ?? {},
            },
          ],
        }
      if (method === 'wallet_disconnect') return null
      if (method === 'wallet_getAssets') {
        const [{ assetTypeFilter, chainFilter }] = params
        const assets: Record<
          string,
          readonly { type: string; [key: string]: unknown }[]
        > = {
          '0x1': [
            {
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              balance: '0x5f5e100',
              metadata: { decimals: 6, name: 'USD Coin', symbol: 'USDC' },
              type: 'erc20',
            },
            {
              address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
              balance: '0x1',
              metadata: {
                name: 'Bored Ape',
                symbol: 'BAYC',
                tokenId: '0x22b8',
              },
              type: 'erc721',
            },
            {
              address: '0x0000000000000000000000000000000000001155',
              balance: '0x64',
              metadata: {},
              type: 'erc1155',
            },
            { balance: '0xde0b6b3a7640000', type: 'native' },
          ],
          '0x2105': [
            {
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              balance: '0x2faf080',
              metadata: { decimals: 6, name: 'USD Coin', symbol: 'USDC' },
              type: 'erc20',
            },
            { balance: '0x6f05b59d3b20000', type: 'native' },
          ],
        }
        return Object.fromEntries(
          Object.entries(assets)
            .filter(
              ([chainId]) => !chainFilter || chainFilter.includes(chainId),
            )
            .map(([chainId, assets]) => [
              chainId,
              assets.filter(
                (asset) =>
                  !assetTypeFilter || assetTypeFilter.includes(asset.type),
              ),
            ]),
        )
      }
      if (method === 'wallet_switchEthereumChain') {
        if (params[0].chainId === '0xfa')
          throw new Provider.ProviderRpcError(4902, 'Unrecognized chain.')
        return null
      }
      if (method === 'wallet_watchAsset') {
        if (params[0].type === 'ERC721')
          throw new Provider.ProviderRpcError(
            -32602,
            'Token type ERC721 not supported.',
          )
        return true
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
      return node.request({ method, params })
    },
  })
  return Client.create({
    account: options.account,
    transport: custom(provider),
  })
}

export declare namespace getWalletClient {
  type Options = {
    account?: Client.create.Options['account'] | undefined
  }
}

export const mainnet = defineAnvil({
  chainId: 1,
  forkBlockNumber: 24_000_000n,
  forkUrl: getEnv('VITE_ANVIL_FORK_URL', 'https://eth.drpc.org'),
  hardfork: 'Prague',
  initialize: clearInheritedAccountCode,
  noMining: true,
  port: Number(getEnv('VITE_ANVIL_PORT', '8545')),
})

/**
 * Non-fork instance for tests that do not need mainnet state. Unknown-hash
 * lookups answer locally (a fork forwards them upstream, adding unbounded
 * latency to pending-transaction polls).
 */
export const local = defineAnvil({
  chainId: 1,
  hardfork: 'Prague',
  noMining: true,
  port: Number(getEnv('VITE_ANVIL_PORT_LOCAL', '8645')),
})

/**
 * Non-fork instance seeded with a fixed, immutable block history (see
 * `fee/getHistory.test.ts`). Tests must not mine or send beyond the seed so
 * historical queries stay deterministic.
 */
export const history = defineAnvil({
  chainId: 1,
  hardfork: 'Prague',
  noMining: true,
  port: Number(getEnv('VITE_ANVIL_PORT_HISTORY', '8745')),
})

/** Optimism fork for OP Stack codec and action tests. */
export const optimism = defineAnvil({
  chainId: 10,
  forkBlockNumber: 147_000_000n,
  forkUrl: getEnv(
    'VITE_ANVIL_FORK_URL_OPTIMISM',
    'https://mainnet.optimism.io',
  ),
  hardfork: 'Prague',
  noMining: true,
  port: Number(getEnv('VITE_ANVIL_PORT_OPTIMISM', '8845')),
})

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  return fallback
}

function defineInitializedAnvil(
  parameters: Instance.anvil.Parameters,
  initialize: (rpcUrl: string) => Promise<void>,
) {
  return Instance.define(() => {
    let stop: (() => void) | undefined
    return {
      host: parameters.host ?? 'localhost',
      name: 'anvil',
      port: parameters.port ?? 8545,
      async start({ port }) {
        const instance = Instance.anvil(parameters).create({ port })
        stop = await instance.start()
        try {
          await initialize(`http://${instance.host}:${instance.port}`)
        } catch (error) {
          await stop()
          stop = undefined
          throw error
        }
      },
      async stop() {
        await stop?.()
      },
    }
  })()
}

/** Removes inherited EIP-7702 delegations from public dev accounts. */
async function clearInheritedAccountCode(rpcUrl: string) {
  const response = await fetch(rpcUrl, {
    body: JSON.stringify(
      constants.accounts.map((account, id) => ({
        id,
        jsonrpc: '2.0',
        method: 'anvil_setCode',
        params: [account.address, '0x'],
      })),
    ),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok)
    throw new Error(`Anvil setup failed with status ${response.status}.`)

  type Response = { error?: { message: string } | undefined }
  const values = (await response.json()) as readonly Response[]
  const error = values.find((value) => value.error)?.error
  if (error) throw new Error(error.message)
}
