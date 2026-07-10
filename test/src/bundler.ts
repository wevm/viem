import { Instance, Server } from 'prool'

import { mainnet } from './anvil.js'
import * as constants from './constants.js'

/** ERC-4337 EntryPoint deployments on the mainnet fork. */
export const entrypoints = {
  '0.6': '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  '0.7': '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  '0.8': '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
} as const

export type Bundler = ReturnType<typeof defineBundler>

/**
 * Defines a prool-managed alto bundler instance, proxied per pool id. Each
 * pool key gets its own alto process pointed at the matching anvil pool
 * instance.
 */
export function defineBundler(parameters: defineBundler.Parameters) {
  const { port, rpcUrl } = parameters
  const url = `http://127.0.0.1:${port}/${constants.poolId}`
  return {
    port,
    rpcUrl: { http: url },
    /** Resets the alto instance for this pool id. */
    async restart() {
      await fetch(`${url}/restart`)
    },
    async start() {
      return Server.create({
        instance: (key) =>
          Instance.alto({
            enableDebugEndpoints: true,
            entrypoints: Object.values(entrypoints),
            executorPrivateKeys: [constants.accounts[3]!.privateKey],
            rpcUrl: rpcUrl(key),
            safeMode: false,
            utilityPrivateKey: constants.accounts[3]!.privateKey,
          }),
        port,
      }).start()
    },
  }
}

export declare namespace defineBundler {
  type Parameters = {
    /** Proxy port the prool server listens on. */
    port: number
    /** Node RPC URL for a given pool key. */
    rpcUrl: (key: number) => string
  }
}

/** Bundler backed by the mainnet fork anvil instance. */
export const bundler = defineBundler({
  port: Number(getEnv('VITE_BUNDLER_PORT', '4337')),
  rpcUrl: (key) => `http://127.0.0.1:${mainnet.port}/${key}`,
})

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  return fallback
}
