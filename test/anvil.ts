import * as Chain from '../src/core/Chain.js'
import * as Client from '../src/core/Client.js'
import { http } from '../src/core/transports/http.js'

export const anvilMainnet = define({
  id: 31_337n,
  name: 'Anvil Mainnet',
  port: 8545,
})

export const anvilOptimism = define({
  id: 31_338n,
  name: 'Anvil Optimism',
  port: 8546,
})

export const instances = [anvilMainnet, anvilOptimism] as const

export type Anvil = ReturnType<typeof define>

export function define<const id extends bigint>(options: {
  id: id
  name: string
  port: number
}) {
  const { id, name, port } = options
  return {
    id,
    name,
    port,
    get chain() {
      return Chain.define({
        id,
        name,
        nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
        rpcUrls: {
          default: {
            http: [getHttpUrl(port)],
            webSocket: [getWebSocketUrl(port)],
          },
        },
      })
    },
    get rpcUrl() {
      return {
        http: getHttpUrl(port),
        webSocket: getWebSocketUrl(port),
      }
    },
  } as const
}

export function getClient<const anvil extends Anvil>(
  anvil: anvil,
  options: getClient.Options = {},
): Client.Client<anvil['chain']> {
  return Client.create({
    chain: anvil.chain,
    transport: http(anvil.rpcUrl.http),
    ...options,
  }) as never
}

export declare namespace getClient {
  type Options = Omit<Client.Options, 'chain' | 'transport'>
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

function getHttpUrl(port: number) {
  return `http://127.0.0.1:${port}/${getPoolId()}`
}

function getWebSocketUrl(port: number) {
  return `ws://127.0.0.1:${port}/${getPoolId()}`
}
