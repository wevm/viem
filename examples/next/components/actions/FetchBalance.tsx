import { useEffect, useState } from 'react'
import { fetchBalance } from 'viem/actions/public'
import { BaseProvider } from 'viem/providers'

export function FetchBalance({ provider }: { provider: BaseProvider }) {
  const [balance, setBalance] = useState<bigint>()
  useEffect(() => {
    ;(async () => {
      setBalance(
        await fetchBalance(provider, {
          address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        }),
      )
    })()
  }, [provider])
  return <div>Balance: {balance?.toString()}</div>
}
