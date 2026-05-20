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

export async function request<returnType = unknown>(
  anvil: Anvil,
  method: string,
  params: readonly unknown[] = [],
) {
  return requestUrl<returnType>(anvil.rpcUrl.http, method, params)
}

export async function requestUrl<returnType = unknown>(
  url: string,
  method: string,
  params: readonly unknown[] = [],
) {
  const response = await fetch(url, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method,
      params,
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  const body = await response.json()
  if (body.error) throw new Error(body.error.message)
  return body.result as returnType
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
