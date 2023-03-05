import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { OnBlockNumberParameter } from 'viem/public'

export function WatchBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<OnBlockNumberParameter>()
  useEffect(() => {
    const unwatch = client.watchBlockNumber({
      emitOnBegin: true,
      onBlockNumber: setBlockNumber,
    })
    return unwatch
  }, [client])
  return <div>{blockNumber?.toString()}</div>
}
