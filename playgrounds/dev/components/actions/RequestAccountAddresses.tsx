import { useState } from 'react'
import { requestAccountAddresses } from 'viem/actions'
import type { WalletClient } from 'viem/clients'

export function RequestAccountAddresses({ client }: { client: WalletClient }) {
  const [addresses, setAddresses] = useState<`0x${string}`[]>()
  return (
    <div>
      <button
        onClick={async () => {
          const addresses = await requestAccountAddresses(client)
          setAddresses(addresses)
        }}
      >
        request addresses
      </button>
      <div>{addresses}</div>
    </div>
  )
}
