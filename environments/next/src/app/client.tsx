'use client'

import { useEffect, useState } from 'react'
import { Client as ViemClient, http, publicActions, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

export function Client() {
  const [success, setSuccess] = useState<boolean | undefined>()
  useEffect(() => {
    ;(async () => {
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

      setSuccess(true)
    })()
  }, [])
  return <div>client: {success ? 'success' : ''}</div>
}
