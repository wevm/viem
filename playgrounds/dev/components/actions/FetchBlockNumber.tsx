import { useEffect, useState } from 'react'
import { FetchBlockNumberResponse, fetchBlockNumber } from 'viem/actions'
import { PublicClient } from 'viem/clients'

export function FetchBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<FetchBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await fetchBlockNumber(client))
    })()
  }, [client])
  return <div>{blockNumber}</div>
}
