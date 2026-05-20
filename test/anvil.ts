import * as Chain from '../src/core/Chain.js'
import * as Client from '../src/core/Client.js'
import { http } from '../src/core/transports/http.js'

let nextId = 31_337n
let nextPort = 8545

export const anvilMainnet = define()
export const anvilOptimism = define()

export const instances = [anvilMainnet, anvilOptimism] as const

export type Anvil = ReturnType<typeof define>

export function define() {
  const id = nextId++
  const port = nextPort++
  const rpcUrl = {
    http: `http://127.0.0.1:${port}/${getPoolId()}`,
    webSocket: `ws://127.0.0.1:${port}/${getPoolId()}`,
  } as const
  return {
    id,
    port,
    rpcUrl,
    get chain() {
      return Chain.define({
        id,
        name: `Anvil ${id}`,
        nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
        rpcUrls: {
          default: { http: [rpcUrl.http], webSocket: [rpcUrl.webSocket] },
        },
      })
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
