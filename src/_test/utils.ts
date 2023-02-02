/* c8 ignore start */
import { localhost } from '../chains'
import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  custom,
  http,
  webSocket,
} from '../clients'
import { rpc } from '../utils'
import { RpcError } from '../types/eip1193'
import { accounts, localWsUrl } from './constants'

import type { RequestListener } from 'http'
import { createServer } from 'http'
import type { AddressInfo } from 'net'

export const publicClient =
  process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket'
    ? createPublicClient({
        chain: localhost,
        pollingInterval: 1_000,
        transport: webSocket(localWsUrl),
      })
    : createPublicClient({
        chain: localhost,
        pollingInterval: 1_000,
        transport: http(),
      })

export const walletClient = createWalletClient({
  transport: custom({
    on: (message: string, listener: (...args: any[]) => null) => {
      if (message === 'accountsChanged') {
        listener([accounts[0].address] as any)
      }
    },
    removeListener: () => null,
    request: async ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') {
        return [accounts[0].address]
      }
      if (method === 'personal_sign') {
        method = 'eth_sign'
        params = [params[1], params[0]]
      }
      if (method === 'wallet_watchAsset') {
        if (params[0].type === 'ERC721') {
          throw new RpcError(-32602, 'Token type ERC721 not supported.')
        }
        return true
      }
      if (method === 'wallet_addEthereumChain') return null
      if (method === 'wallet_switchEthereumChain') {
        if (params[0].chainId === '0xfa') {
          throw new RpcError(-4902, 'Unrecognized chain.')
        }
        return null
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

      const { result } = await rpc.http(localhost.rpcUrls.default.http[0], {
        body: {
          method,
          params,
        },
      })
      return result
    },
  }),
})

export const testClient = createTestClient({
  chain: localhost,
  mode: 'anvil',
  transport: http(),
})

export function createHttpServer(
  handler: RequestListener,
): Promise<{ close: () => Promise<unknown>; url: string }> {
  const server = createServer(handler)

  const closeAsync = () =>
    new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve(undefined))),
    )

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo
      resolve({ close: closeAsync, url: `http://localhost:${port}` })
    })
  })
}
/* c8 ignore stop */
