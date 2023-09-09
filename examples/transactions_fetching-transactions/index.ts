import { http, createPublicClient, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const hash =
  '0xfa76a53a1b816c30f98f5456982cd0ccbb2c88b24049c928dfe4db6c8ae89aed'

const [transaction, transactionReceipt, confirmations] = await Promise.all([
  client.getTransaction({ hash }),
  client.getTransactionReceipt({ hash }),
  client.getTransactionConfirmations({ hash }),
])

export default [
  `Current confirmations: ${confirmations}`,
  `Transaction: 
    <details>
      <summary>View</summary>
      <pre><code>${stringify(transaction, null, 2)}</code></pre>
    </details>
  `,
  `Transaction receipt: 
    <details>
      <summary>View</summary>
      <pre><code>${stringify(transactionReceipt, null, 2)}</code></pre>
    </details>
  `,
]
