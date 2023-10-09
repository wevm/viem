import { TimeoutError } from '~viem/index.js'
import { withTimeout } from '~viem/utils/promise/withTimeout.js'
import { getSocket, rpc } from '../../utils/rpc.js'
import type { Chain } from '../index.js'
import * as chains from '../index.js'
import { describe, expect, test } from 'bun:test'

const TIMEOUT = 10_000

function isLocalNetwork(url: string): boolean {
  const u = new URL(url)
  const localNetworkRegex =
    /^(127\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.)/

  return localNetworkRegex.test(u.hostname) || u.hostname === 'localhost'
}

async function fetchChainIdFromHttpRpcUrl(
  url: string,
): Promise<bigint | undefined> {
  const chainId = await rpc
    .http(url, {
      body: { method: 'eth_chainId' },
      fetchOptions: { headers: { 'Content-Type': 'application/json' } },
      timeout: TIMEOUT,
    })
    .then((r) => r.result)
  return chainId ? BigInt(chainId) : undefined
}

async function testHTTPRpcUrls(chain: Chain): Promise<void> {
  const rpcUrls = [...chain.rpcUrls.default.http, ...chain.rpcUrls.public.http]
  try {
    for (const url of rpcUrls) {
      if (isLocalNetwork(url)) continue
      const chainId = await fetchChainIdFromHttpRpcUrl(url)
      expect(chainId).toBe(BigInt(chain.id))
    }
  } catch (error) {
    expect(error).toBeUndefined()
  }
}

async function testWsRpcUrls(chain: Chain): Promise<void> {
  const wsUrls = [
    ...(chain.rpcUrls.default.webSocket ?? []),
    ...(chain.rpcUrls.public.webSocket ?? []),
  ]
  try {
    for (const url of wsUrls) {
      if (isLocalNetwork(url)) continue

      const socket = await withTimeout(() => getSocket(url), {
        errorInstance: new TimeoutError({
          body: {},
          url,
        }),
        timeout: TIMEOUT,
      })
      const chainId = await rpc
        .webSocketAsync(socket, {
          body: { method: 'eth_chainId' },
          timeout: TIMEOUT,
        })
        .then((r) => r.result)
      socket.close()
      expect(chainId).toBe(BigInt(chain.id))
    }
  } catch (error) {
    expect(error).toBeUndefined()
  }
}

async function testExplorerUrl(chain: Chain): Promise<void> {
  const explorerUrl = chain.blockExplorers?.default.url

  if (!explorerUrl) return

  try {
    await fetch(explorerUrl, { method: 'HEAD' })
    expect(true).toBe(true)
  } catch (error) {
    expect(error).toBeUndefined()
  }
}

describe.each(Object.values(chains))('chainUrlsCheck', (chain) => {
  test(chain.name, async () => {
    try {
      await Promise.all([
        testHTTPRpcUrls(chain),
        testWsRpcUrls(chain),
        testExplorerUrl(chain),
      ])
      expect(true).toBe(true)
    } catch (error) {
      expect(error).toBeUndefined()
    }
  })
})
