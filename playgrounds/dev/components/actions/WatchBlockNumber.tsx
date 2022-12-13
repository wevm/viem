import { useEffect, useState } from 'react'
import type { WatchBlockNumberResponse } from 'viem/actions'
import { watchBlockNumber } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

export function WatchBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<WatchBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(client, setBlockNumber, {
      emitOnBegin: true,
    })
    return unwatch
  }, [client])
  return <div>{blockNumber?.toString()}</div>
}
