import { createPublicClient, http } from 'viem'
import { mainnet, polygon } from 'viem/chains'

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

// const blockNumber = await publicClients.mainnet.getBlockNumber()
// const blockNumber = await publicClients.polygon.getBlockNumber()
// console.log('blockNumber', blockNumber)

////////////////////////////////////////////////////////////////////
// Events, Logs & Filters

// const logs = await publicClients.mainnet.getLogs()
// console.log(logs)

publicClients.mainnet.watchEvent({
  onError(error) {
    console.log(error)
  },
  onLogs(logs) {
    console.log(logs)
  },
})

////////////////////////////////////////////////////////////////////
