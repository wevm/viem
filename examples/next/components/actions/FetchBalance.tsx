import { useEffect, useState } from 'react'
import { fetchBalance } from 'viem/actions/public'
import { BaseProvider } from 'viem/providers'

export function FetchBalance({
  address = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  provider,
}: {
  address?: `0x${string}`
  provider: BaseProvider
}) {
  const [balance, setBalance] = useState<bigint>()
  useEffect(() => {
    ;(async () => {
      setBalance(
        await fetchBalance(provider, {
          address,
        }),
      )
    })()
  }, [address, provider])
  return <div>Balance: {balance?.toString()} wei</div>
}
