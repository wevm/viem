'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, http, webSocket } from 'viem'
import { foundry } from 'viem/chains'

export function Client() {
  const [success, setSuccess] = useState<boolean | undefined>()
  useEffect(() => {
    ;(async () => {
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

      setSuccess(true)
    })()
  }, [])
  return <div>client: {success ? 'success' : ''}</div>
}
