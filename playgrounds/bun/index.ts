import { createPublicClient, http } from 'viem'
import { mainnet, polygon } from 'viem/chains'
import { getBlockNumber, getLogs, watchEvent } from 'viem/public'

////////////////////////////////////////////////////////////////////
// Clients

export const publicClients = {
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  polygon: createPublicClient({
    chain: polygon,
    transport: http(),
  }),
}

////////////////////////////////////////////////////////////////////
// Blocks

// const blockNumber = await getBlockNumber(publicClients.mainnet)
// const blockNumber = await getBlockNumber(publicClients.polygon)
// console.log('blockNumber', blockNumber)

////////////////////////////////////////////////////////////////////
// Events, Logs & Filters

// const logs = await getLogs(publicClients.mainnet)
// console.log(logs)

watchEvent(publicClients.mainnet, {
  onError(error) {
    console.log(error)
  },
  onLogs(logs) {
    console.log(logs)
  },
})

////////////////////////////////////////////////////////////////////
