import { createPublicClient, webSocket } from 'viem'
import { redstone } from 'viem/chains'

const webSocketClient = createPublicClient({
  chain: redstone,
  transport: webSocket(),
})

setInterval(async () => {
  try {
    const blockNumber = await webSocketClient.getBlockNumber()
    document.getElementById('app')!.innerText = `Block number: ${blockNumber}`
  } catch (e) {
    console.error(e)
  }
}, 1000)
