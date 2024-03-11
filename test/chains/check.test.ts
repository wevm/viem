import { expect, test } from 'bun:test'

import * as chains from '~viem/chains/index.js'
import type { Chain } from '~viem/types/chain.js'
import { withTimeout } from '~viem/utils/promise/withTimeout.js'
import { request as httpRequest } from '~viem/utils/rpc/http.js'
import { getWebSocketRpcClient } from '~viem/utils/rpc/webSocket.js'

const defaultTimeout = 10_000

const chains_ = Object.values(chains) as readonly Chain[]
chains_.forEach((chain) => {
  const httpRpcUrls = chain.rpcUrls.default.http
  if (httpRpcUrls)
    test(
      `${chain.name}: check http urls`,
      async () => {
        await assertHttpRpcUrls(chain.id, httpRpcUrls)
      },
      { timeout: defaultTimeout },
    )

  const webSocketRpcUrls = chain.rpcUrls.default.webSocket
  if (webSocketRpcUrls)
    test(
      `${chain.name}: check web socket urls`,
      async () => {
        await assertWebSocketRpcUrls(chain.id, webSocketRpcUrls)
      },
      { timeout: defaultTimeout },
    )

  const explorerUrl = chain.blockExplorers?.default.url
  if (explorerUrl)
    test(
      `${chain.name}: check block explorer`,
      async () => {
        await assertExplorerUrl(explorerUrl)
      },
      { timeout: defaultTimeout },
    )

  const explorerApiUrl = chain.blockExplorers?.default.apiUrl
  if (explorerApiUrl)
    test(
      `${chain.name}: check block explorer API`,
      async () => {
        await assertExplorerApiUrl(explorerApiUrl)
      },
      { timeout: defaultTimeout },
    )
})

function isLocalNetwork(url: string): boolean {
  const u = new URL(url)
  const localNetworkRegex =
    /^(127\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.)/

  return localNetworkRegex.test(u.hostname) || u.hostname === 'localhost'
}

async function assertHttpRpcUrls(
  chainId: number,
  rpcUrls: readonly string[],
): Promise<void> {
  for (const url of rpcUrls) {
    if (isLocalNetwork(url)) continue
    const response = await httpRequest(url, {
      body: { method: 'eth_chainId' },
      fetchOptions: { headers: { 'Content-Type': 'application/json' } },
      timeout: defaultTimeout,
    }).then((r) => r.result)
    expect(BigInt(response)).toBe(BigInt(chainId))
  }
}

async function assertWebSocketRpcUrls(
  chainId: number,
  rpcUrls: readonly string[],
): Promise<void> {
  for (const url of rpcUrls) {
    if (isLocalNetwork(url)) continue

    const client = await withTimeout(() => getWebSocketRpcClient(url), {
      timeout: defaultTimeout,
    })
    const response = await client
      .requestAsync({
        body: { method: 'eth_chainId' },
        timeout: defaultTimeout,
      })
      .then((r) => r.result)
    client.close()
    expect(BigInt(response)).toBe(BigInt(chainId))
  }
}

async function assertExplorerUrl(explorerUrl: string): Promise<void> {
  await fetch(explorerUrl, { method: 'HEAD' })
}

async function assertExplorerApiUrl(explorerApiUrl: string): Promise<void> {
  const url = `${explorerApiUrl}?module=block&action=getblocknobytime&closest=before&timestamp=${Math.floor(
    Date.now() / 1000,
  )}`
  const response = await fetch(url)
  const data = await response.json()
  expect(data).toMatchObject({
    status: '1',
    message: expect.stringContaining('OK'),
  })
}
