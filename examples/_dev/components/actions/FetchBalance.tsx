import { useEffect, useState } from 'react'
import { fetchBalance } from 'viem/actions'
import { NetworkRpc } from 'viem/rpcs'

export function FetchBalance({
  address = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  rpc,
}: {
  address?: `0x${string}`
  rpc: NetworkRpc
}) {
  const [balance, setBalance] = useState<bigint>()
  useEffect(() => {
    ;(async () => {
      setBalance(
        await fetchBalance(rpc, {
          address,
        }),
      )
    })()
  }, [address, rpc])
  return <div>Balance: {balance?.toString()} wei</div>
}
