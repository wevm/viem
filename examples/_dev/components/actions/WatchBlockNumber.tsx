import { useEffect, useState } from 'react'
import { WatchBlockNumberResponse, watchBlockNumber } from 'viem/actions'
import { NetworkRpc } from 'viem/rpcs'

export function WatchBlockNumber({ rpc }: { rpc: NetworkRpc }) {
  const [blockNumber, setBlockNumber] = useState<WatchBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(rpc, setBlockNumber, {
      emitOnBegin: true,
    })
    return unwatch
  }, [rpc])
  return <div>{blockNumber}</div>
}
