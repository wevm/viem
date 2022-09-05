import { useEffect, useState } from 'react'
import { WatchBlocksResponse, watchBlocks } from 'viem/actions'
import { NetworkProvider } from 'viem/providers/network'
import { WalletProvider } from 'viem/providers/wallet'

export function WatchBlocks({
  provider,
}: {
  provider: NetworkProvider | WalletProvider
}) {
  const [block, setBlock] = useState<WatchBlocksResponse>()
  useEffect(() => {
    const unwatch = watchBlocks(provider, setBlock, { emitOnOpen: true })
    return unwatch
  }, [provider])
  return <div>{block?.hash}</div>
}
