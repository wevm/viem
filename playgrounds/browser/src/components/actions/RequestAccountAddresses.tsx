import { useState } from 'react'
import type { WalletClient } from 'viem'

export function RequestAccountAddresses({ client }: { client: WalletClient }) {
  const [addresses, setAddresses] = useState<`0x${string}`[]>()
  return (
    <div>
      <button
        onClick={async () => {
          const addresses = await client.requestAccounts()
          setAddresses(addresses)
        }}
      >
        request addresses
      </button>
      <div>{addresses}</div>
    </div>
  )
}
