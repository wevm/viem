import { useEffect, useState } from 'react'
import type { WatchBlocksResponse } from 'viem/actions'
import { watchBlocks } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

export function WatchBlocks({ client }: { client: PublicClient }) {
  const [block, setBlock] = useState<WatchBlocksResponse>()
  useEffect(() => {
    const unwatch = watchBlocks(client, setBlock, { emitOnBegin: true })
    return unwatch
  }, [client])
  return <div>{block?.hash}</div>
}
