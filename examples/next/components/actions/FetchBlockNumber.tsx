import { useEffect, useState } from 'react'
import { FetchBlockNumberResponse, fetchBlockNumber } from 'viem/actions/public'
import { BaseProvider } from 'viem/providers'

export function FetchBlockNumber({ provider }: { provider: BaseProvider }) {
  const [blockNumber, setBlockNumber] = useState<FetchBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await fetchBlockNumber(provider))
    })()
  }, [provider])
  return <div>{blockNumber}</div>
}
