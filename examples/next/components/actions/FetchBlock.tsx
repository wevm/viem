import { useEffect, useState } from 'react'
import { FetchBlockResponse, fetchBlock } from 'viem/actions'
import { NetworkProvider, WalletProvider } from 'viem/providers'

export function FetchBlock({
  provider,
}: {
  provider: NetworkProvider | WalletProvider
}) {
  const [latestBlock, setLatestBlock] = useState<FetchBlockResponse>()
  const [block, setBlock] = useState<FetchBlockResponse>()

  useEffect(() => {
    ;(async () => {
      setLatestBlock(await fetchBlock(provider, { blockTag: 'latest' }))
      setBlock(await fetchBlock(provider, { blockNumber: 42069 }))
    })()
  }, [provider])
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
