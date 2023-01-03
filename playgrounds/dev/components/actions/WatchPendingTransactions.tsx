import { useEffect, useState } from 'react'
import type { OnTransactionsResponse } from 'viem/actions'
import { watchPendingTransactions } from 'viem/actions'
import type { PublicClient } from 'viem/clients'

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
