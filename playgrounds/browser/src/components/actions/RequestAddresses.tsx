import { useState } from 'react'
import type { WalletClient } from 'viem'

export function RequestAddresses({ client }: { client: WalletClient }) {
  const [addresses, setAddresses] = useState<`0x${string}`[]>()
  return (
    <div>
      <button
        onClick={async () => {
          const addresses = await client.requestAddresses()
          setAddresses(addresses)
        }}
        type="button"
      >
        request addresses
      </button>
      <div>{addresses}</div>
    </div>
  )
}
