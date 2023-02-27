import { getAccount, WalletClient } from 'viem'
import { parseEther } from 'viem'

export function SendTransaction({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          const [address] = await client.getAddresses()
          const account = getAccount(address)
          await client.sendTransaction({
            account,
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
