'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

export function Client() {
  const [success, setSuccess] = useState<boolean | undefined>()
  useEffect(() => {
    ;(async () => {
      const client = createPublicClient({
        chain: mainnet,
        transport: http('https://ethereum-rpc.publicnode.com'),
      })

      const webSocketClient = createPublicClient({
        chain: mainnet,
        transport: webSocket('wss://mainnet.gateway.tenderly.co'),
      })

      await client.getBlockNumber()
      await webSocketClient.getBlockNumber()

      setSuccess(true)
    })()
  }, [])
  return <div>client: {success ? 'success' : ''}</div>
}
