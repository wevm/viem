import { useEffect, useState } from 'react'
import { WatchBlocksResponse, watchBlocks } from 'viem/actions'
import { NetworkRpc } from 'viem/rpcs'

export function WatchBlocks({ rpc }: { rpc: NetworkRpc }) {
  const [block, setBlock] = useState<WatchBlocksResponse>()
  useEffect(() => {
    const unwatch = watchBlocks(rpc, setBlock, { emitOnBegin: true })
    return unwatch
  }, [rpc])
  return <div>{block?.hash}</div>
}
