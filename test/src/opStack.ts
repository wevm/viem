import { optimismSepolia } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { anvilOptimism, anvilOptimismSepolia } from './anvil.js'
import { accounts } from './constants.js'

export const optimismClient = createClient({
  chain: anvilOptimism.chain,
  transport: http(),
}).extend(() => ({ mode: 'anvil' }))

export const optimismSepoliaClient = createClient({
  chain: optimismSepolia,
  transport: http(anvilOptimismSepolia.rpcUrl.http),
}).extend(() => ({ mode: 'anvil' }))

export const optimismClientWithAccount = createClient({
  account: accounts[0].address,
  chain: anvilOptimism.chain,
  transport: http(),
})

export const optimismClientWithoutChain = createClient({
  transport: http(anvilOptimism.rpcUrl.http),
})
