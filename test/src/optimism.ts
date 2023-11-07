import { optimism } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'

export const optimismAddress = {
  alice: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
  bob: '0x5a52e96bacdabb82fd05763e25335261b270efcb',
} as const

export const optimismClient = createClient({
  chain: optimism,
  transport: http(process.env.VITE_ANVIL_FORK_URL_OPTIMISM),
})

export const optimismClientWithAccount = createClient({
  account: optimismAddress.alice as `0x${string}`,
  chain: optimism,
  transport: http(process.env.VITE_ANVIL_FORK_URL_OPTIMISM),
})

export const optimismClientWithoutChain = createClient({
  transport: http(process.env.VITE_ANVIL_FORK_URL_OPTIMISM),
})
