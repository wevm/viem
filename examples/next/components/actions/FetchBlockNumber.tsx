import { useEffect, useState } from 'react'
import { FetchBlockNumberResponse, fetchBlockNumber } from 'viem/actions'
import { NetworkProvider, WalletProvider } from 'viem/providers'

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
