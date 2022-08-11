import { useState } from 'react'
import { requestAccountAddresses } from 'viem/actions/wallet'
import { InjectedProvider } from 'viem/providers'

export function RequestAccountAddresses({
  onAddresses,
  provider,
}: {
  onAddresses?: (address: `0x${string}`[]) => void
  provider: InjectedProvider
}) {
  const [addresses, setAddresses] = useState<`0x${string}`[]>()
  return (
    <div>
      <button
        onClick={async () => {
          const addresses = await requestAccountAddresses(provider)
          setAddresses(addresses)
          onAddresses?.(addresses)
        }}
      >
        request addresses
      </button>
      <div>{addresses}</div>
    </div>
  )
}
