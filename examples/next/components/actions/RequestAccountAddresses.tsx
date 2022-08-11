import { useState } from 'react'
import { requestAccountAddresses } from 'viem/actions/wallet'
import { InjectedProvider } from 'viem/providers'

export function RequestAccountAddresses({
  provider,
}: {
  provider: InjectedProvider
}) {
  const [addresses, setAddresses] = useState<string[]>()
  return (
    <div>
      <button
        onClick={async () =>
          setAddresses(await requestAccountAddresses(provider))
        }
      >
        request addresses
      </button>
      <div>{addresses}</div>
    </div>
  )
}
