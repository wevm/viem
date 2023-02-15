import type { WalletClient } from 'viem'
import { parseEther } from 'viem/utils'
import { sendTransaction } from 'viem/wallet'

export function SendTransaction({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          const [account] = await client.request({ method: 'eth_accounts' })
          await sendTransaction(client, {
            from: account,
            to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            value: parseEther('0.0001'),
          })
        }}
      >
        send it
      </button>
    </div>
  )
}
