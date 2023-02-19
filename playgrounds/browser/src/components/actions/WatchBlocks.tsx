import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { OnBlockResponse } from 'viem/public'

export function WatchBlocks({ client }: { client: PublicClient }) {
  const [block, setBlock] = useState<OnBlockResponse>()
  useEffect(() => {
    const unwatch = client.watchBlocks({
      emitOnBegin: true,
      onBlock: setBlock,
    })
    return unwatch
  }, [client])
  return <div>{block?.hash}</div>
}
