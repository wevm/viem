import * as Provider from 'ox/Provider'
import { Instance, Server } from 'prool'
import { Client, custom, http } from 'viem'

import * as constants from './constants.js'

export type DefineAnvilParameters = Instance.anvil.Parameters & {
  /** Proxy port the prool server listens on. */
  port: number
}

export type Anvil = ReturnType<typeof defineAnvil>

/** Defines a prool-managed anvil instance, proxied per pool id. */
export function defineAnvil(parameters: DefineAnvilParameters) {
  const { port, ...options } = parameters
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
    async start() {
      return Server.create({ instance: Instance.anvil(options), port }).start()
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
  forkBlockNumber: 22263623n,
  forkUrl: getEnv('VITE_ANVIL_FORK_URL', 'https://eth.drpc.org'),
  hardfork: 'Prague',
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

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  return fallback
}
