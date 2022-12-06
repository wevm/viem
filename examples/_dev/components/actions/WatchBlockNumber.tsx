import { useEffect, useState } from 'react'
import { WatchBlockNumberResponse, watchBlockNumber } from 'viem/actions'
import { PublicClient } from 'viem/clients'

export function WatchBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<WatchBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(client, setBlockNumber, {
      emitOnBegin: true,
    })
    return unwatch
  }, [client])
  return <div>{blockNumber}</div>
}
