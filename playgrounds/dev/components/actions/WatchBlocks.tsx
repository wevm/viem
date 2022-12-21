import { useEffect, useState } from 'react'
import type { OnBlockResponse } from 'viem/actions'
import { watchBlocks } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

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
