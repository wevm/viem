import { useEffect, useState } from 'react'
import { FetchBlockNumberResponse, fetchBlockNumber } from 'viem/actions'
import { NetworkProvider } from 'viem/providers/network'
import { WalletProvider } from 'viem/providers/wallet'

export function FetchBlockNumber({
  provider,
}: {
  provider: NetworkProvider | WalletProvider
}) {
  const [blockNumber, setBlockNumber] = useState<FetchBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await fetchBlockNumber(provider))
    })()
  }, [provider])
  return <div>{blockNumber}</div>
}
