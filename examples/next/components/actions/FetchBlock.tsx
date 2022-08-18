import { useEffect, useState } from 'react'
import { FetchBlockResponse, fetchBlock } from 'viem/actions/public'
import { NetworkProvider, WalletProvider } from 'viem/providers'

export function FetchBlock({
  provider,
}: {
  provider: NetworkProvider | WalletProvider
}) {
  const [block, setBlock] = useState<FetchBlockResponse>()
  useEffect(() => {
    ;(async () => {
      setBlock(await fetchBlock(provider, { blockTime: 'latest' }))
      setBlock(await fetchBlock(provider, { blockNumber: 42069 }))
    })()
  }, [provider])
  return (
    <div>
      <details>
        <summary>latest</summary>
        <div>{JSON.stringify(block, undefined, 4)}</div>
      </details>
      <details>
        <summary>block 42069</summary>
        <div>{JSON.stringify(block, undefined, 4)}</div>
      </details>
    </div>
  )
}
