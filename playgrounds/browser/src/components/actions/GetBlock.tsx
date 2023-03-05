import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { GetBlockReturnType } from 'viem/public'

export function GetBlock({ client }: { client: PublicClient }) {
  const [latestBlock, setLatestBlock] = useState<GetBlockReturnType>()
  const [block, setBlock] = useState<GetBlockReturnType>()

  useEffect(() => {
    ;(async () => {
      setLatestBlock(await client.getBlock({ blockTag: 'latest' }))
      setBlock(await client.getBlock({ blockNumber: 42069n }))
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
