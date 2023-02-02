import { useEffect, useState } from 'react'
import type { PublicClient } from 'viem'
import type { OnTransactionsResponse } from 'viem/public'
import { watchPendingTransactions } from 'viem/public'

export function WatchPendingTransactions({ client }: { client: PublicClient }) {
  const [transactions, setTransactions] = useState<OnTransactionsResponse>([])
  useEffect(() => {
    try {
      const unwatch = watchPendingTransactions(client, {
        onError: (err) => console.log(err),
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
