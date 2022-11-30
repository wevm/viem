import { useState } from 'react'
import { requestAccountAddresses } from 'viem/actions'
import { WalletRpc } from 'viem/rpcs'

export function RequestAccountAddresses({ rpc }: { rpc: WalletRpc }) {
  const [addresses, setAddresses] = useState<`0x${string}`[]>()
  return (
    <div>
      <button
        onClick={async () => {
          const addresses = await requestAccountAddresses(rpc)
          setAddresses(addresses)
        }}
      >
        request addresses
      </button>
      <div>{addresses}</div>
    </div>
  )
}
