import { describe, expect, test } from 'vitest'

import * as allChains from '../../src/chains/index.js'
import { withTimeout } from '../../src/utils/promise/withTimeout.js'
import { getHttpRpcClient } from '../../src/utils/rpc/http.js'
import { getWebSocketRpcClient } from '../../src/utils/rpc/webSocket.js'

const defaultTimeout = 10_000

const chains = Object.values(allChains) as readonly allChains.Chain[]

describe.each(chains)('$name', ({ name, ...chain }) => {
  const rpcUrls = chain.rpcUrls
  const blockExplorer = chain.blockExplorers?.default

  test.concurrent(
    'http',
    async () => {
      for (const url of rpcUrls.default.http) {
        if (isLocalNetwork(url)) continue

        const client = getHttpRpcClient(url, {
          fetchOptions: { headers: { 'Content-Type': 'application/json' } },
          timeout: defaultTimeout,
        })
        const chainId = await client
          .request({
            body: { method: 'eth_chainId' },
          })
          .then((r) => Number(r.result))

        expect(chainId).toBe(chain.id)
      }
    },
    defaultTimeout,
  )

  test.concurrent(
    'webSocket',
    async () => {
      for (const url of rpcUrls.default.webSocket ?? []) {
        if (isLocalNetwork(url)) continue

        const client = await withTimeout(() => getWebSocketRpcClient(url), {
          timeout: defaultTimeout,
        })
        const chainId = await client
          .requestAsync({
            body: { method: 'eth_chainId' },
          })
          .then((r) => Number(r.result))
        client.close()

        expect(chainId).toBe(chain.id)
      }
    },
    defaultTimeout,
  )

  test.concurrent(
    'blockExplorer.url',
    async () => {
      if (!blockExplorer) return
      await fetch(blockExplorer.url, { method: 'HEAD' })
    },
    defaultTimeout,
  )

  test.concurrent(
    'blockExplorer.apiUrl',
    async () => {
      if (!blockExplorer?.apiUrl) return

      const response = await fetch(
        `${
          blockExplorer.apiUrl
        }?module=block&action=getblocknobytime&closest=before&timestamp=${Math.floor(
          Date.now() / 1000,
        )}`,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const data = await response.json()
      expect(data).toMatchObject({
        status: '1',
        message: expect.stringContaining('OK'),
      })
    },
    defaultTimeout,
  )
})

function isLocalNetwork(url: string): boolean {
  const { hostname } = new URL(url)
  const localNetworkRegex =
    /^(127\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.)/
  return localNetworkRegex.test(hostname) || hostname === 'localhost'
}
