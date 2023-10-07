import { BaseError } from '~viem/index.js'
import { getSocket, rpc } from '../../utils/rpc.js'
import type { Chain } from '../index.js'
import * as chains from '../index.js'

const TIMEOUT = 50_000

class RpcMismatchedError extends BaseError {
  override name = 'RpcMismatchedError'
  constructor({
    chain,
    url,
    chainId,
  }: { chain: Chain; url: string; chainId: unknown }) {
    super(
      `Chain id mismatch for ${chain.name} at ${url}. Expected ${chain.id}, got ${chainId}`,
    )
  }
}

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

async function checkHTTPRpcUrls(chain: Chain): Promise<void> {
  const rpcUrls = [...chain.rpcUrls.default.http, ...chain.rpcUrls.public.http]

  for (const url of rpcUrls) {
    if (isLocalNetwork(url)) continue
    const chainId = await fetchChainIdFromHttpRpcUrl(url)
    if (!chainId || BigInt(chainId) !== BigInt(chain.id)) {
      throw new RpcMismatchedError({ chain, url, chainId })
    }
  }
}

async function checkWsRpcUrls(chain: Chain): Promise<void> {
  const wsUrls = [
    ...(chain.rpcUrls.default.webSocket ?? []),
    ...(chain.rpcUrls.public.webSocket ?? []),
  ]

  for (const url of wsUrls) {
    if (isLocalNetwork(url)) continue
    const socket = await getSocket(url)
    const chainId = await rpc
      .webSocketAsync(socket, {
        body: { method: 'eth_chainId' },
        timeout: TIMEOUT,
      })
      .then((r) => r.result)
    socket.close()
    if (!chainId || BigInt(chainId) !== BigInt(chain.id)) {
      throw new RpcMismatchedError({ chain, url, chainId })
    }
  }
}

async function checkExplorerUrl(chain: Chain): Promise<void> {
  const explorerUrl = chain.blockExplorers?.default.url

  if (!explorerUrl) return

  await fetch(explorerUrl, { method: 'HEAD' })
}

const allChains = Object.values(chains)

const passedChains: Chain[] = []
const failedChains: Chain[] = []

for (const [index, chain] of allChains.entries()) {
  console.log(`🔎 checking ${chain.name} (${index + 1}/${allChains.length})`)
  try {
    await checkHTTPRpcUrls(chain)
    await checkWsRpcUrls(chain)
    await checkExplorerUrl(chain)

    passedChains.push(chain)
  } catch (error) {
    failedChains.push(chain)

    if (error instanceof Error) {
      console.error(error.message)
    } else {
      throw error
    }
  }
}

console.log(`🔧 check ${allChains.length} chains url availability: `)
console.log(`✅ ${passedChains.length} chains passed`)
console.log(`❌ ${failedChains.length} chains failed`)
