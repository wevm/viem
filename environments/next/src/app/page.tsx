import { createPublicClient, http, webSocket } from 'viem'
import { foundry } from 'viem/chains'
import { Client } from './client'

export default async function Home() {
  const client = createPublicClient({
    chain: foundry,
    transport: http('http://127.0.0.1:18545'),
  })

  const webSocketClient = createPublicClient({
    chain: foundry,
    transport: webSocket('ws://127.0.0.1:18545'),
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
