import { useEffect, useState } from 'react'
import type { FetchBlockNumberResponse } from 'viem/actions'
import { fetchBlockNumber } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

export function FetchBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<FetchBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await fetchBlockNumber(client))
    })()
  }, [client])
  return <div>{blockNumber?.toString()}</div>
}
