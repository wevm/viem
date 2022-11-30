import { useEffect, useState } from 'react'
import { FetchBlockResponse, fetchBlock } from 'viem/actions'
import { NetworkRpc } from 'viem/rpcs'

export function FetchBlock({ rpc }: { rpc: NetworkRpc }) {
  const [latestBlock, setLatestBlock] = useState<FetchBlockResponse>()
  const [block, setBlock] = useState<FetchBlockResponse>()

  useEffect(() => {
    ;(async () => {
      setLatestBlock(await fetchBlock(rpc, { blockTag: 'latest' }))
      setBlock(await fetchBlock(rpc, { blockNumber: 42069 }))
    })()
  }, [rpc])
  return (
    <div>
      <details>
        <summary>latest</summary>
        <div>
          {JSON.stringify(
            latestBlock,
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            4,
          )}
        </div>
      </details>
      <details>
        <summary>block 42069</summary>
        <div>
          {JSON.stringify(
            block,
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            4,
          )}
        </div>
      </details>
    </div>
  )
}
