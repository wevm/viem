import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { GetBlockNumberResponse } from 'viem/public'

export function GetBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<GetBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await client.getBlockNumber())
    })()
  }, [client])
  return <div>{blockNumber?.toString()}</div>
}
