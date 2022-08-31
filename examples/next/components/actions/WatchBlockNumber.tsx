import { useEffect, useState } from 'react'
import { WatchBlockNumberResponse, watchBlockNumber } from 'viem/actions'
import { NetworkProvider, WalletProvider } from 'viem/providers'

export function WatchBlockNumber({
  provider,
}: {
  provider: NetworkProvider | WalletProvider
}) {
  const [blockNumber, setBlockNumber] = useState<WatchBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(provider, setBlockNumber, {
      emitOnOpen: true,
    })
    return unwatch
  }, [provider])
  return <div>{blockNumber}</div>
}
