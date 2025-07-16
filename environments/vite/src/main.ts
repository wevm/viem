import { createPublicClient, webSocket } from 'viem'
import { redstone } from 'viem/chains'

const webSocketClient = createPublicClient({
  chain: redstone,
  transport: webSocket(),
})

setInterval(async () => {
  const blockNumber = await webSocketClient.getBlockNumber()
  console.log(blockNumber)
  document.getElementById('app')!.innerText = `Block number: ${blockNumber}`
}, 1000)