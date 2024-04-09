import { type Chain, optimism, optimismSepolia } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { accounts, warn } from './constants.js'

export let anvilPortOptimism: number
if (process.env.VITE_ANVIL_PORT_OPTIMISM) {
  anvilPortOptimism = Number(process.env.VITE_ANVIL_PORT_OPTIMISM)
} else {
  anvilPortOptimism = 8645
  warn(
    `\`VITE_ANVIL_PORT_OPTIMISM\` not found. Falling back to \`${anvilPortOptimism}\`.`,
  )
}

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export let anvilPortOptimismSepolia: number
if (process.env.VITE_ANVIL_PORT_OPTIMISM_SEPOLIA) {
  anvilPortOptimismSepolia = Number(
    process.env.VITE_ANVIL_PORT_OPTIMISM_SEPOLIA,
  )
} else {
  anvilPortOptimismSepolia = 8945
  warn(
    `\`VITE_ANVIL_PORT_OPTIMISM_SEPOLIA\` not found. Falling back to \`${anvilPortOptimismSepolia}\`.`,
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

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export let forkBlockNumberOptimismSepolia: bigint
if (process.env.VITE_ANVIL_BLOCK_NUMBER_OPTIMISM_SEPOLIA) {
  forkBlockNumberOptimismSepolia = BigInt(
    Number(process.env.VITE_ANVIL_BLOCK_NUMBER_OPTIMISM_SEPOLIA),
  )
} else {
  forkBlockNumberOptimismSepolia = 9596386n
  warn(
    `\`VITE_ANVIL_BLOCK_NUMBER_OPTIMISM_SEPOLIA\` not found. Falling back to \`${forkBlockNumberOptimismSepolia}\`.`,
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

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export let forkUrlOptimismSepolia: string
if (process.env.VITE_ANVIL_FORK_URL_OPTIMISM_SEPOLIA) {
  forkUrlOptimismSepolia = process.env.VITE_ANVIL_FORK_URL_OPTIMISM_SEPOLIA
} else {
  forkUrlOptimismSepolia = 'https://sepolia.optimism.io'
  warn(
    `\`VITE_ANVIL_FORK_URL_OPTIMISM_SEPOLIA\` not found. Falling back to \`${forkUrlOptimismSepolia}\`.`,
  )
}

export const poolId = Number(process.env.VITEST_POOL_ID ?? 1)
export const localHttpUrlOptimism = `http://127.0.0.1:${anvilPortOptimism}/${poolId}`
export const localHttpUrlOptimismSepolia = `http://127.0.0.1:${anvilPortOptimismSepolia}/${poolId}`
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

export const optimismSepoliaClient = createClient({
  chain: optimismSepolia,
  transport: http(localHttpUrlOptimismSepolia),
}).extend(() => ({ mode: 'anvil' }))

export const optimismClientWithAccount = createClient({
  account: accounts[0].address,
  chain: optimismAnvilChain,
  transport: http(),
})

export const optimismClientWithoutChain = createClient({
  transport: http(localHttpUrlOptimism),
})
