import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { OnBlockResponse } from 'viem/public'
import { watchBlocks } from 'viem/public'

export function WatchBlocks({ client }: { client: PublicClient }) {
  const [block, setBlock] = useState<OnBlockResponse>()
  useEffect(() => {
    const unwatch = watchBlocks(client, {
      emitOnBegin: true,
      onBlock: setBlock,
    })
    return unwatch
  }, [client])
  return <div>{block?.hash}</div>
}
