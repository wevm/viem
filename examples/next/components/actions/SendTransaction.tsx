import { sendTransaction } from 'viem/actions/account'
import { AccountProvider } from 'viem/providers'
import { etherValue } from 'viem/utils'

export function SendTransaction({ provider }: { provider: AccountProvider }) {
  return (
    <div>
      <button
        onClick={async () =>
          await sendTransaction(provider, {
            request: {
              from: provider.address as `0x${string}`,
              to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
              value: etherValue('0.0001'),
            },
          })
        }
      >
        send it
      </button>
    </div>
  )
}
