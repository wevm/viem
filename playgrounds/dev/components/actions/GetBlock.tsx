import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { GetBlockResponse } from 'viem/public'
import { getBlock } from 'viem/public'

export function GetBlock({ client }: { client: PublicClient }) {
  const [latestBlock, setLatestBlock] = useState<GetBlockResponse>()
  const [block, setBlock] = useState<GetBlockResponse>()

  useEffect(() => {
    ;(async () => {
      setLatestBlock(await getBlock(client, { blockTag: 'latest' }))
      setBlock(await getBlock(client, { blockNumber: 42069n }))
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
