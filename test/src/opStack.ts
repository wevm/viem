import { type Chain, mainnet, optimism } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { createPublicClient } from '~viem/clients/createPublicClient.js'
import { http } from '~viem/clients/transports/http.js'
import { createTestClient } from '~viem/index.js'
import { accounts, warn } from './constants.js'
import { createHttpServer } from './utils.js'

export let anvilPortOptimism: number
if (process.env.VITE_ANVIL_PORT_OPTIMISM) {
  anvilPortOptimism = Number(process.env.VITE_ANVIL_PORT_OPTIMISM)
} else {
  anvilPortOptimism = 8645
  warn(
    `\`VITE_ANVIL_PORT_OPTIMISM\` not found. Falling back to \`${anvilPortOptimism}\`.`,
  )
}

export let forkBlockNumberOptimism: bigint
if (process.env.VITE_ANVIL_BLOCK_NUMBER_OPTIMISM) {
  forkBlockNumberOptimism = BigInt(
    Number(process.env.VITE_ANVIL_BLOCK_NUMBER_OPTIMISM),
  )
} else {
  forkBlockNumberOptimism = 113624777n
  warn(
    `\`VITE_ANVIL_BLOCK_NUMBER_OPTIMISM\` not found. Falling back to \`${forkBlockNumberOptimism}\`.`,
  )
}

export let forkUrlOptimism: string
if (process.env.VITE_ANVIL_FORK_URL_OPTIMISM) {
  forkUrlOptimism = process.env.VITE_ANVIL_FORK_URL_OPTIMISM
} else {
  forkUrlOptimism = 'https://mainnet.optimism.io'
  warn(
    `\`VITE_ANVIL_FORK_URL_OPTIMISM\` not found. Falling back to \`${forkUrlOptimism}\`.`,
  )
}

export const poolId = Number(process.env.VITEST_POOL_ID ?? 1)
export const localHttpUrlOptimism = `http://127.0.0.1:${anvilPortOptimism}/${poolId}`
export const localWsUrlOptimism = `ws://127.0.0.1:${anvilPortOptimism}/${poolId}`

export const optimismAnvilChain = {
  ...optimism,
  rpcUrls: {
    default: {
      http: [localHttpUrlOptimism],
      webSocket: [localWsUrlOptimism],
    },
  },
} as const satisfies Chain

export const optimismClient = createClient({
  chain: optimismAnvilChain,
  transport: http(),
}).extend(() => ({ mode: 'anvil' }))

export const optimismClientWithAccount = createClient({
  account: accounts[0].address,
  chain: optimismAnvilChain,
  transport: http(),
})

export const optimismClientWithoutChain = createClient({
  transport: http(localHttpUrlOptimism),
})

/**
 * @experimental
 * A simple test utility that simply starts and stops a tevm server running mainnet
 * l1 devnet with Optimism mainnet contracts deployed. Also returns a public client
 * Can be nuked in favor of using anvil once OP stack contracts are deployed
 */
export const createL1Server = async () => {
  const { createHttpHandler } = await import('@tevm/server')
  const { createL1Client } = await import('@tevm/opstack')

  const evmClient = createL1Client()
  await evmClient.ready()

  const handler = createHttpHandler(evmClient)

  const server = await createHttpServer(handler)

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(server.url),
  })

  const testClient = createTestClient({
    mode: 'anvil',
    transport: http(server.url),
    chain: mainnet,
  })

  // return only the server
  // returning the tevm client would be useful so we could interact with it in tests
  // but we want these tests to not be coupled to tevm. Thus they should only
  // interact with the server via http JSON-RPC using eth_ and anvil_ methods
  return { server, publicClient, testClient }
}

/* c8 ignore stop */
