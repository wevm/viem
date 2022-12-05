import { useEffect, useState } from 'react'
import { fetchBalance } from 'viem/actions'
import { NetworkClient } from 'viem/clients'

export function FetchBalance({
  address = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  client,
}: {
  address?: `0x${string}`
  client: NetworkClient
}) {
  const [balance, setBalance] = useState<bigint>()
  useEffect(() => {
    ;(async () => {
      setBalance(
        await fetchBalance(client, {
          address,
        }),
      )
    })()
  }, [address, client])
  return <div>Balance: {balance?.toString()} wei</div>
}
