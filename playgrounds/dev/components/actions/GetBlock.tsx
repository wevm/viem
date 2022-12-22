import { useEffect, useState } from 'react'
import type { GetBlockResponse } from 'viem/actions'
import { getBlock } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

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
