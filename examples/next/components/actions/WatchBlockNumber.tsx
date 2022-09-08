import { useEffect, useState } from 'react'
import { WatchBlockNumberResponse, watchBlockNumber } from 'viem/actions'
import { NetworkProvider } from 'viem/providers/network'
import { WalletProvider } from 'viem/providers/wallet'

export function WatchBlockNumber({
  provider,
}: {
  provider: NetworkProvider | WalletProvider
}) {
  const [blockNumber, setBlockNumber] = useState<WatchBlockNumberResponse>()
  useEffect(() => {
    const unwatch = watchBlockNumber(provider, setBlockNumber, {
      emitOnBegin: true,
    })
    return unwatch
  }, [provider])
  return <div>{blockNumber}</div>
}
