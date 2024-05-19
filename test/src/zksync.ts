import { zkSyncLocalNode } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/index.js'
import { accounts } from './constants.js'

export const zkSyncClientLocalNode = createClient({
  chain: zkSyncLocalNode,
  transport: http(),
})

export const zkSyncClientLocalNodeWithAccount = createClient({
  account: accounts[0].address,
  chain: zkSyncLocalNode,
  transport: http(),
})

export function getZksyncMockProvider(
  request: ({
    method,
    params,
  }: { method: string; params?: unknown }) => Promise<any>,
) {
  return {
    on: () => null,
    removeListener: () => null,
    request: ({ method, params }: any) => request({ method, params }),
  }
}
