import { useEffect, useState } from 'react'
import type { OnBlockNumberResponse } from 'viem/actions'
import { watchBlockNumber } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

export function WatchBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<OnBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(client, {
      emitOnBegin: true,
      onBlockNumber: setBlockNumber,
    })
    return unwatch
  }, [client])
  return <div>{blockNumber?.toString()}</div>
}
