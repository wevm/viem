import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { OnTransactionsParameter } from 'viem/public'

export function WatchPendingTransactions({ client }: { client: PublicClient }) {
  const [transactions, setTransactions] = useState<OnTransactionsParameter>([])
  useEffect(() => {
    try {
      const unwatch = client.watchPendingTransactions({
        onError: (_err) => console.log(client.transport.url),
        onTransactions: setTransactions,
      })
      return unwatch
    } catch (err) {
      console.log(err)
    }
  }, [client])
  return (
    <div style={{ maxHeight: 300, overflow: 'scroll' }}>
      {transactions.map((hash, i) => (
        <div key={i}>{hash}</div>
      ))}
    </div>
  )
}
