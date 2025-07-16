import { createPublicClient, webSocket, fallback, http } from 'viem'
import { redstone } from 'viem/chains'

const webSocketClient = createPublicClient({
  chain: redstone,
  transport: fallback([
    webSocket(undefined, { reconnect: { attempts: 100, delay: 1000 } }),
    http(),
  ]),
})

setInterval(async () => {
  try {
    const blockNumber = await webSocketClient.getBlockNumber()
    document.getElementById('app')!.innerText = `Block number: ${blockNumber}`
  } catch (e) {
    console.error(e)
  }
}, 1000)
