import { sendTransaction } from 'viem/actions'
import { WalletRpc } from 'viem/rpcs'
import { etherToValue } from 'viem/utils'

export function SendTransaction({ rpc }: { rpc: WalletRpc }) {
  return (
    <div>
      <button
        onClick={async () => {
          const [account] = await rpc.request({ method: 'eth_accounts' })
          await sendTransaction(rpc, {
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
