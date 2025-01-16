import { createServer } from 'prool'
import { type AnvilParameters, anvil } from 'prool/instances'

export const poolId =
  Number(process.env.VITEST_POOL_ID ?? 1) *
    Number(process.env.VITEST_SHARD_ID ?? 1) +
  (process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket' ? 100 : 0)

export const mainnet = from({
  forkUrl: getEnv('VITE_ANVIL_FORK_URL', 'https://cloudflare-eth.com'),
  forkBlockNumber: 21605830n,
  noMining: true,
  port: 8545,
})

export const instances = [mainnet] as const

export type Anvil<parameters extends AnvilParameters> = {
  config: parameters
  rpcUrl: {
    http: string
    ipc: string
    ws: string
  }
  restart: () => Promise<void>
  start: () => Promise<() => Promise<void>>
}

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  console.warn(
    `\`process.env.${key}\` not found. Falling back to \`${fallback}\`.`,
  )
  return fallback
}

function from<const parameters extends AnvilParameters>(
  parameters: parameters,
): Anvil<parameters> {
  const { port, ...options } = parameters
  const rpcUrl = {
    http: `http://127.0.0.1:${port}/${poolId}`,
    ipc: `/tmp/anvil-${poolId}.ipc`,
    ws: `ws://127.0.0.1:${port}/${poolId}`,
  } as const

  const config = {
    ...options,
    hardfork: 'Prague',
  } as const

  return {
    config,
    rpcUrl,
    async restart() {
      await fetch(`${rpcUrl.http}/restart`)
    },
    async start() {
      return await createServer({
        instance: anvil(config),
        port,
      }).start()
    },
  } as never
}
