import { Client as ViemClient, http, publicActions, webSocket } from 'viem'
import { mainnet } from 'viem/chains'
import { Client } from './client'

export default async function Home() {
  const client = ViemClient.create({
    chain: mainnet,
    transport: http('https://ethereum-rpc.publicnode.com'),
  }).extend(publicActions())

  const webSocketClient = ViemClient.create({
    chain: mainnet,
    transport: webSocket('wss://mainnet.gateway.tenderly.co'),
  }).extend(publicActions())

  await client.block.getNumber()
  await webSocketClient.block.getNumber()

  return (
    <>
      <div>server: success</div>
      <Client />
    </>
  )
}
