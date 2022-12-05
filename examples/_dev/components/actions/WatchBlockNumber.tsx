import { useEffect, useState } from 'react'
import { WatchBlockNumberResponse, watchBlockNumber } from 'viem/actions'
import { NetworkClient } from 'viem/clients'

export function WatchBlockNumber({ client }: { client: NetworkClient }) {
  const [blockNumber, setBlockNumber] = useState<WatchBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(client, setBlockNumber, {
      emitOnBegin: true,
    })
    return unwatch
  }, [client])
  return <div>{blockNumber}</div>
}
