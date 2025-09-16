import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'
import { Client } from './client'

export default async function Home() {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  const webSocketClient = createPublicClient({
    chain: mainnet,
    transport: webSocket('wss://eth.drpc.org'),
  })

  await client.getBlockNumber()
  await webSocketClient.getBlockNumber()

  return (
    <>
      <div>server: success</div>
      <Client />
    </>
  )
}
