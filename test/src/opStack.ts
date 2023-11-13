import { Chain, optimism } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { warn } from './constants.js'

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
  forkBlockNumberOptimism = 112157877n
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

export const optimismAddress = {
  alice: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
  bob: '0x5a52e96bacdabb82fd05763e25335261b270efcb',
} as const

export const optimismClient = createClient({
  chain: optimismAnvilChain,
  transport: http(),
})

export const optimismClientWithAccount = createClient({
  account: optimismAddress.alice,
  chain: optimismAnvilChain,
  transport: http(),
})

export const optimismClientWithoutChain = createClient({
  transport: http(localHttpUrlOptimism),
})
