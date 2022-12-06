import { useEffect, useState } from 'react'
import type { FetchBlockResponse } from 'viem/actions'
import { fetchBlock } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

export function FetchBlock({ client }: { client: PublicClient }) {
  const [latestBlock, setLatestBlock] = useState<FetchBlockResponse>()
  const [block, setBlock] = useState<FetchBlockResponse>()

  useEffect(() => {
    ;(async () => {
      setLatestBlock(await fetchBlock(client, { blockTag: 'latest' }))
      setBlock(await fetchBlock(client, { blockNumber: 42069 }))
    })()
  }, [client])

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
