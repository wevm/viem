import { useEffect, useState } from 'react'
import { FetchBlockNumberResponse, fetchBlockNumber } from 'viem/actions'
import { NetworkClient } from 'viem/clients'

export function FetchBlockNumber({ client }: { client: NetworkClient }) {
  const [blockNumber, setBlockNumber] = useState<FetchBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await fetchBlockNumber(client))
    })()
  }, [client])
  return <div>{blockNumber}</div>
}
