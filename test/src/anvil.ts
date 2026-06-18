import { Instance, Server } from 'prool'

import { poolId } from './constants.js'

const port = 8545
const forkUrl = getEnv('VITE_ANVIL_FORK_URL', 'https://eth.drpc.org')
const forkBlockNumber = 22263623n

/** A mainnet-fork anvil instance (prool), proxied per pool id. */
export const anvilMainnet = {
  forkBlockNumber,
  forkUrl,
  port,
  rpcUrl: {
    http: `http://127.0.0.1:${port}/${poolId}`,
  },
  async start() {
    return Server.create({
      instance: Instance.anvil({
        chainId: 1,
        forkBlockNumber,
        forkUrl,
        hardfork: 'Prague',
        noMining: true,
      }),
      port,
    }).start()
  },
}

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  return fallback
}
