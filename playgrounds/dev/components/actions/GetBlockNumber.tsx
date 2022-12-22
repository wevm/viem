import { useEffect, useState } from 'react'
import type { GetBlockNumberResponse } from 'viem/actions'
import { getBlockNumber } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

export function GetBlockNumber({ client }: { client: PublicClient }) {
  const [blockNumber, setBlockNumber] = useState<GetBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await getBlockNumber(client))
    })()
  }, [client])
  return <div>{blockNumber?.toString()}</div>
}
