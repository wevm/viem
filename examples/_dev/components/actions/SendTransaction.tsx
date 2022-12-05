import { sendTransaction } from 'viem/actions'
import { WalletClient } from 'viem/clients'
import { etherToValue } from 'viem/utils'

export function SendTransaction({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          const [account] = await client.request({ method: 'eth_accounts' })
          await sendTransaction(client, {
            request: {
              from: account,
              to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              value: etherToValue('0.0001'),
            },
          })
        }}
      >
        send it
      </button>
    </div>
  )
}
