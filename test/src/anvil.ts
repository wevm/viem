import { Instance, Server } from 'prool'
import { Client, http } from 'viem'

import { poolId } from './constants.js'

export type DefineAnvilParameters = Instance.anvil.Parameters & {
  /** Proxy port the prool server listens on. */
  port: number
}

export type Anvil = ReturnType<typeof defineAnvil>

/** Defines a prool-managed anvil instance, proxied per pool id. */
export function defineAnvil(parameters: DefineAnvilParameters) {
  const { port, ...options } = parameters
  const rpcUrl = {
    http: `http://127.0.0.1:${port}/${poolId}`,
    ipc: `/tmp/anvil-${poolId}.ipc`,
    ws: `ws://127.0.0.1:${port}/${poolId}`,
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

export const anvilMainnet = defineAnvil({
  chainId: 1,
  forkBlockNumber: 22263623n,
  forkUrl: getEnv('VITE_ANVIL_FORK_URL', 'https://eth.drpc.org'),
  hardfork: 'Prague',
  noMining: true,
  port: 8545,
})

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  return fallback
}
