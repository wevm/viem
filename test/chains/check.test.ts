import { expect, test } from 'bun:test'

import * as chains from '~viem/chains/index.js'
import type { Chain } from '~viem/types/chain.js'
import { withTimeout } from '~viem/utils/promise/withTimeout.js'
import { getSocket, rpc } from '~viem/utils/rpc.js'

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
    const response = await rpc
      .http(url, {
        body: { method: 'eth_chainId' },
        fetchOptions: { headers: { 'Content-Type': 'application/json' } },
        timeout: defaultTimeout,
      })
      .then((r) => r.result)
    expect(BigInt(response)).toBe(BigInt(chainId))
  }
}

async function assertWebSocketRpcUrls(
  chainId: number,
  rpcUrls: readonly string[],
): Promise<void> {
  for (const url of rpcUrls) {
    if (isLocalNetwork(url)) continue

    const socket = await withTimeout(() => getSocket(url), {
      timeout: defaultTimeout,
    })
    const response = await rpc
      .webSocketAsync(socket, {
        body: { method: 'eth_chainId' },
        timeout: defaultTimeout,
      })
      .then((r) => r.result)
    socket.close()
    expect(BigInt(response)).toBe(BigInt(chainId))
  }
}

async function assertExplorerUrl(explorerUrl: string): Promise<void> {
  await fetch(explorerUrl, { method: 'HEAD' })
}
