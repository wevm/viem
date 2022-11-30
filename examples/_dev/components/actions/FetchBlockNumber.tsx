import { useEffect, useState } from 'react'
import { FetchBlockNumberResponse, fetchBlockNumber } from 'viem/actions'
import { NetworkRpc } from 'viem/rpcs'

export function FetchBlockNumber({ rpc }: { rpc: NetworkRpc }) {
  const [blockNumber, setBlockNumber] = useState<FetchBlockNumberResponse>()
  useEffect(() => {
    ;(async () => {
      setBlockNumber(await fetchBlockNumber(rpc))
    })()
  }, [rpc])
  return <div>{blockNumber}</div>
}
