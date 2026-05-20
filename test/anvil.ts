import * as Chain from '../src/core/Chain.js'

export const anvilMainnet = defineAnvil({
  id: 31_337n,
  name: 'Anvil Mainnet',
  portEnv: 'VIEM_TEST_ANVIL_MAINNET_PORT',
})

export const anvilOptimism = defineAnvil({
  id: 31_338n,
  name: 'Anvil Optimism',
  portEnv: 'VIEM_TEST_ANVIL_OPTIMISM_PORT',
})

export const instances = [anvilMainnet, anvilOptimism] as const

export type Anvil = ReturnType<typeof defineAnvil>

export function defineAnvil<const id extends bigint>(options: {
  id: id
  name: string
  portEnv: string
}) {
  const { id, name, portEnv } = options
  return {
    id,
    name,
    portEnv,
    get chain() {
      return Chain.define({
        id,
        name,
        nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
        rpcUrls: {
          default: {
            http: [getHttpUrl(portEnv)],
            webSocket: [getWebSocketUrl(portEnv)],
          },
        },
      })
    },
    get rpcUrl() {
      return {
        http: getHttpUrl(portEnv),
        webSocket: getWebSocketUrl(portEnv),
      }
    },
  } as const
}

export function getPoolId() {
  return Number(process.env.VITEST_POOL_ID ?? 1)
}

function getHttpUrl(portEnv: string) {
  return `http://127.0.0.1:${getPort(portEnv)}/${getPoolId()}`
}

function getWebSocketUrl(portEnv: string) {
  return `ws://127.0.0.1:${getPort(portEnv)}/${getPoolId()}`
}

function getPort(portEnv: string) {
  const port = process.env[portEnv]
  if (!port)
    throw new Error(
      `Missing ${portEnv}. Ensure Vitest global setup started the Anvil test servers.`,
    )
  return port
}
